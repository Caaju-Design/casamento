#!/usr/bin/env node
import { google } from "googleapis";
import { randomBytes } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";

/**
 * Preenche a coluna "Link" da aba "Convidados" para toda linha que já tem
 * Nome mas ainda não tem link — gera um token opaco e não sequencial (ver
 * docs/architecture/adr/0003-acesso-sem-login-e-link-unico-por-convidado.md)
 * e grava a URL completa do convite. Nunca sobrescreve um link já existente.
 *
 * Uso: node scripts/generate-invite-links.mjs
 * Lê as variáveis de ambiente de .env.local (mesmo arquivo usado pela app).
 */

function loadEnvLocal() {
  const path = new URL("../.env.local", import.meta.url);
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split("\n")) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (!(key in process.env)) {
      process.env[key] = rawValue.replace(/^"|"$/g, "");
    }
  }
}

function slugify(nome) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateToken(nome) {
  const suffix = randomBytes(4).toString("hex");
  const base = slugify(nome) || "convidado";
  return `${base}-${suffix}`;
}

loadEnvLocal();

const SHEET_NAME = "Convidados";
const SHEET_RANGE = `${SHEET_NAME}!A2:F`;
const siteUrl = (process.env.SITE_URL ?? "https://casamento.caaju.com.br").replace(/\/$/, "");

const spreadsheetId = process.env.GOOGLE_SHEETS_RSVP_SPREADSHEET_ID;
const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

if (!spreadsheetId || !email || !privateKey) {
  console.error("Faltam variáveis de ambiente (GOOGLE_SHEETS_RSVP_SPREADSHEET_ID / credenciais). Configure .env.local.");
  process.exit(1);
}

const auth = new google.auth.JWT({
  email,
  key: privateKey.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

const { data } = await sheets.spreadsheets.values.get({ spreadsheetId, range: SHEET_RANGE });
const rows = data.values ?? [];

const updates = [];
const generated = [];

rows.forEach((row, index) => {
  const nome = row[0]?.trim();
  const link = row[5]?.trim();
  if (!nome || link) return;

  const token = generateToken(nome);
  const url = `${siteUrl}/convite/${token}`;
  const sheetRowNumber = index + 2;
  updates.push({ range: `${SHEET_NAME}!F${sheetRowNumber}`, values: [[url]] });
  generated.push({ nome, url });
});

if (updates.length === 0) {
  console.log("Nenhuma linha nova para gerar link — toda linha com nome já tem link.");
  process.exit(0);
}

await sheets.spreadsheets.values.batchUpdate({
  spreadsheetId,
  requestBody: { valueInputOption: "RAW", data: updates },
});

console.log(`Gerados ${generated.length} link(s) novo(s):\n`);
for (const { nome, url } of generated) {
  console.log(`${nome}: ${url}`);
}
