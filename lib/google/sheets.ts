import { google, sheets_v4 } from "googleapis";

/**
 * Integração com a planilha Google Sheets que guarda a lista de convidados
 * e recebe as confirmações de presença, consumida pelo Looker Studio
 * (ver docs/architecture/adr/0002-armazenamento-em-google-sheets-e-drive.md).
 *
 * Layout real da aba "Convidados" (linha 1 = cabeçalho, planilha preparada
 * pelo casal — não pelo agente):
 *   A: Nome   B: E-mail   C: Telefone   D: RSVP   E: Drive   F: Link
 *
 * Não existe uma coluna de "token" separada: o token do convite é o último
 * trecho do caminho da URL guardada na coluna "Link" (ex.:
 * ".../convite/laura-8f2a1c" → token "laura-8f2a1c"). Esse link é gerado
 * por `scripts/generate-invite-links.mjs`, não digitado à mão.
 *
 * O convidado nunca fala diretamente com a API do Google — só o servidor
 * (rotas em app/api/**) importa este módulo.
 */

export interface GuestInvite {
  token: string;
  nome: string;
  status: "pendente" | "confirmado";
}

export interface RsvpDetails {
  nome: string;
  email: string;
  telefone: string;
}

export interface GiftIdea {
  titulo: string;
  descricao: string;
}

const SHEET_NAME = "Convidados";
const SHEET_RANGE = `${SHEET_NAME}!A2:F`;

const GIFTS_SHEET_NAME = "Presentes";
const GIFTS_SHEET_RANGE = `${GIFTS_SHEET_NAME}!A2:B`;

const COLUMN = { NOME: 0, EMAIL: 1, TELEFONE: 2, RSVP: 3, DRIVE: 4, LINK: 5 } as const;

let cachedClient: sheets_v4.Sheets | null = null;

function getSpreadsheetId(): string {
  const id = process.env.GOOGLE_SHEETS_RSVP_SPREADSHEET_ID;
  if (!id) {
    throw new Error("GOOGLE_SHEETS_RSVP_SPREADSHEET_ID não configurado");
  }
  return id;
}

function getSheetsClient(): sheets_v4.Sheets {
  if (cachedClient) return cachedClient;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!email || !privateKey) {
    throw new Error("Credenciais da conta de serviço do Google não configuradas");
  }

  const auth = new google.auth.JWT({
    email,
    // Em variáveis de ambiente o \n normalmente chega escapado.
    key: privateKey.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  cachedClient = google.sheets({ version: "v4", auth });
  return cachedClient;
}

/**
 * Extrai o token do último trecho do caminho de uma URL de convite
 * (ex.: "https://casamento.caaju.com.br/convite/laura-8f2a1c" → "laura-8f2a1c").
 * Retorna `null` se a célula estiver vazia ou não parecer uma URL de convite.
 */
export function extractTokenFromInviteLink(link: string | undefined | null): string | null {
  if (!link) return null;
  const trimmed = link.trim();
  if (!trimmed) return null;
  const segments = trimmed.split("/").filter(Boolean);
  const last = segments.at(-1);
  return last && last !== "convite" ? last : null;
}

async function fetchGuestRows(sheets: sheets_v4.Sheets, spreadsheetId: string): Promise<string[][]> {
  const response = await sheets.spreadsheets.values.get({ spreadsheetId, range: SHEET_RANGE });
  return response.data.values ?? [];
}

/** Busca o convite correspondente a um token. Retorna `null` se não existir. */
export async function getInviteByToken(token: string): Promise<GuestInvite | null> {
  const sheets = getSheetsClient();
  const rows = await fetchGuestRows(sheets, getSpreadsheetId());
  const row = rows.find((candidate) => extractTokenFromInviteLink(candidate[COLUMN.LINK]) === token);
  if (!row) return null;

  return {
    token,
    nome: row[COLUMN.NOME] ?? "",
    status: row[COLUMN.RSVP]?.trim().toLowerCase() === "confirmado" ? "confirmado" : "pendente",
  };
}

/** Grava a confirmação de presença na linha do convidado correspondente ao token. */
export async function recordRsvp(token: string, details: RsvpDetails): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const rows = await fetchGuestRows(sheets, spreadsheetId);
  const rowIndex = rows.findIndex((candidate) => extractTokenFromInviteLink(candidate[COLUMN.LINK]) === token);
  if (rowIndex === -1) {
    throw new Error("Token não encontrado na planilha de convidados");
  }

  // Linha 2 é o primeiro registro (linha 1 é cabeçalho), daí o +2.
  const sheetRowNumber = rowIndex + 2;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_NAME}!A${sheetRowNumber}:D${sheetRowNumber}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[details.nome, details.email, details.telefone, "confirmado"]],
    },
  });
}

/**
 * Busca as ideias de presente na aba "Presentes" (A: Nome do presente,
 * B: Descrição — preenchida pelo casal, não pelo agente). Não tem Pix por
 * item: o código Pix é único e compartilhado (ver `PIX_CODE` em `.env`),
 * a lista aqui é só de referência do que a contribuição ajuda a comprar.
 */
export async function getGiftIdeas(): Promise<GiftIdea[]> {
  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: GIFTS_SHEET_RANGE,
  });
  const rows = response.data.values ?? [];
  return rows
    .filter((row) => row[0]?.trim())
    .map((row) => ({ titulo: row[0].trim(), descricao: row[1]?.trim() ?? "" }));
}
