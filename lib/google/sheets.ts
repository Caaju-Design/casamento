import { google, sheets_v4 } from "googleapis";

/**
 * Integração com a planilha Google Sheets que guarda a lista de convidados
 * e recebe as confirmações de presença, consumida pelo Looker Studio
 * (ver docs/architecture/adr/0002-armazenamento-em-google-sheets-e-drive.md).
 *
 * Layout esperado da aba "Convidados" (linha 1 = cabeçalho):
 *   A: Token   B: Nome   C: Email   D: Telefone   E: Status   F: ConfirmadoEm
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

const SHEET_NAME = "Convidados";
const SHEET_RANGE = `${SHEET_NAME}!A2:F`;

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

/** Busca o convite correspondente a um token. Retorna `null` se não existir. */
export async function getInviteByToken(token: string): Promise<GuestInvite | null> {
  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: SHEET_RANGE,
  });

  const rows = response.data.values ?? [];
  const row = rows.find((candidate) => candidate[0] === token);
  if (!row) return null;

  return {
    token,
    nome: row[1] ?? "",
    status: row[4] === "confirmado" ? "confirmado" : "pendente",
  };
}

/** Grava a confirmação de presença na linha do convidado correspondente ao token. */
export async function recordRsvp(token: string, details: RsvpDetails): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: SHEET_RANGE,
  });
  const rows = response.data.values ?? [];
  const rowIndex = rows.findIndex((candidate) => candidate[0] === token);
  if (rowIndex === -1) {
    throw new Error("Token não encontrado na planilha de convidados");
  }

  // Linha 2 é o primeiro registro (linha 1 é cabeçalho), daí o +2.
  const sheetRowNumber = rowIndex + 2;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_NAME}!B${sheetRowNumber}:F${sheetRowNumber}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[details.nome, details.email, details.telefone, "confirmado", new Date().toISOString()]],
    },
  });
}
