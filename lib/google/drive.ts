import { google, drive_v3, docs_v1 } from "googleapis";
import { Readable } from "node:stream";

/**
 * Integração com o Google Drive (foto) e Google Docs (mensagem/depoimento)
 * do casal — uma subpasta por convidado dentro de `GOOGLE_DRIVE_ROOT_FOLDER_ID`
 * (ver docs/architecture/adr/0002-armazenamento-em-google-sheets-e-drive.md).
 *
 * O convidado nunca fala diretamente com a API do Google: o arquivo passa
 * pelo servidor (app/api/upload/route.ts), que valida tipo/tamanho antes de
 * reenviar para o Drive.
 */

export interface UploadableFile {
  filename: string;
  mimeType: string;
  bytes: Uint8Array;
}

let cachedAuth: InstanceType<typeof google.auth.JWT> | null = null;

function getAuth() {
  if (cachedAuth) return cachedAuth;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!email || !privateKey) {
    throw new Error("Credenciais da conta de serviço do Google não configuradas");
  }

  cachedAuth = new google.auth.JWT({
    email,
    key: privateKey.replace(/\\n/g, "\n"),
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/documents",
    ],
  });
  return cachedAuth;
}

function getDriveClient(): drive_v3.Drive {
  return google.drive({ version: "v3", auth: getAuth() });
}

function getDocsClient(): docs_v1.Docs {
  return google.docs({ version: "v1", auth: getAuth() });
}

function getRootFolderId(): string {
  const id = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  if (!id) {
    throw new Error("GOOGLE_DRIVE_ROOT_FOLDER_ID não configurado");
  }
  return id;
}

/**
 * Localiza a subpasta do convidado (nomeada com o próprio token) dentro da
 * pasta raiz; cria a subpasta caso a estrutura ainda não tenha sido
 * preparada pelo casal (ver docs/product/pendencias.md).
 */
async function findOrCreateGuestFolder(drive: drive_v3.Drive, token: string): Promise<string> {
  const rootFolderId = getRootFolderId();
  const escapedToken = token.replace(/'/g, "\\'");
  const query = `'${rootFolderId}' in parents and name = '${escapedToken}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;

  const existing = await drive.files.list({
    q: query,
    fields: "files(id, name)",
    pageSize: 1,
  });

  const found = existing.data.files?.[0]?.id;
  if (found) return found;

  const created = await drive.files.create({
    requestBody: {
      name: token,
      mimeType: "application/vnd.google-apps.folder",
      parents: [rootFolderId],
    },
    fields: "id",
  });

  if (!created.data.id) {
    throw new Error("Não foi possível criar a pasta do convidado no Drive");
  }
  return created.data.id;
}

/** Envia a foto do convidado para a subpasta correspondente no Drive. */
export async function uploadGuestPhoto(token: string, file: UploadableFile): Promise<{ fileId: string }> {
  const drive = getDriveClient();
  const folderId = await findOrCreateGuestFolder(drive, token);

  const response = await drive.files.create({
    requestBody: {
      name: file.filename,
      parents: [folderId],
    },
    media: {
      mimeType: file.mimeType,
      body: Readable.from(Buffer.from(file.bytes)),
    },
    fields: "id",
  });

  if (!response.data.id) {
    throw new Error("Envio da foto ao Drive não retornou identificador do arquivo");
  }
  return { fileId: response.data.id };
}

/** Grava a mensagem/depoimento do convidado como um Google Doc na pasta dele. */
export async function saveGuestMessage(token: string, message: string): Promise<{ documentId: string }> {
  const drive = getDriveClient();
  const docs = getDocsClient();
  const folderId = await findOrCreateGuestFolder(drive, token);

  const created = await drive.files.create({
    requestBody: {
      name: `Mensagem - ${token}`,
      mimeType: "application/vnd.google-apps.document",
      parents: [folderId],
    },
    fields: "id",
  });

  const documentId = created.data.id;
  if (!documentId) {
    throw new Error("Criação do documento de mensagem não retornou identificador");
  }

  await docs.documents.batchUpdate({
    documentId,
    requestBody: {
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: message,
          },
        },
      ],
    },
  });

  return { documentId };
}
