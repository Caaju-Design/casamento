import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

/**
 * Tipografia oficial (Google Fonts, licença OFL — ver app/fonts/*-OFL.txt),
 * servida pelo próprio site via next/font/local: sem pedido a servidor de
 * fonte de terceiro, com preload e sem "pulo" de layout.
 *  - Italianno → títulos, nomes e textos da história (fontFamily.display / script).
 *    É uma caligrafia de x-height bem baixa: `.font-display` em globals.css
 *    usa `font-size-adjust` pra ela ficar legível nos mesmos tamanhos.
 *  - Cardo     → textos, subtítulos e menu (fontFamily.body): 400, 400 itálico e 700.
 * Só o subconjunto latino (cobre todos os acentos do português).
 * Os nomes das variáveis CSS espelham docs/design-system/tokens/primitivos.tokens.json.
 */
const italianno = localFont({
  src: "./fonts/italianno-latin-400.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-italianno",
  display: "swap",
  fallback: ["Snell Roundhand", "cursive"],
});
const cardo = localFont({
  src: [
    { path: "./fonts/cardo-latin-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/cardo-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/cardo-latin-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-cardo",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

/**
 * Assinatura do rodapé ("Com amor, Gabi e Manu"): Grape Nuts, letra de mão
 * simples, de caneta, escolhida pelo Manu (licença OFL, livre pra uso
 * comercial — a Photograph Signature do dafont é só pra uso pessoal). Só o
 * latino; sem preload, só baixa quando chega no fim da página.
 */
const signature = localFont({
  src: [{ path: "./fonts/grape-nuts-latin-400.woff2", weight: "400", style: "normal" }],
  variable: "--font-signature",
  display: "swap",
  preload: false,
  fallback: ["cursive"],
});

/**
 * Versão em árabe (/ar): Aref Ruqaa (caligrafia) no lugar da Italianno e
 * Amiri no lugar da Cardo — só o subconjunto árabe (com `unicode-range`);
 * letras latinas (nomes próprios), números e pontuação ficam na Cardo. Sem preload: só baixam na página em
 * árabe. As trocas ficam em app/globals.css (`[lang="ar"]`).
 */
const arefRuqaa = localFont({
  src: [
    { path: "./fonts/aref-ruqaa-arabic-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/aref-ruqaa-arabic-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-aref",
  display: "swap",
  preload: false,
  // só o alfabeto árabe: espaço, pontuação, parênteses, números e letras latinas vêm da Cardo.
  // Sem a fonte "Fallback" automática do next/font: ela é uma Arial local SEM
  // unicode-range, então pegava os números e nomes latinos antes da Cardo
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+0600-06FF, U+0750-077F, U+0870-08FF, U+FB50-FDFF, U+FE70-FEFF, U+200C-200F" }],
});
const amiri = localFont({
  src: [
    { path: "./fonts/amiri-arabic-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/amiri-arabic-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-amiri",
  display: "swap",
  preload: false,
  // só o alfabeto árabe: espaço, pontuação, parênteses, números e letras latinas vêm da Cardo.
  // Sem a fonte "Fallback" automática do next/font: ela é uma Arial local SEM
  // unicode-range, então pegava os números e nomes latinos antes da Cardo
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+0600-06FF, U+0750-077F, U+0870-08FF, U+FB50-FDFF, U+FE70-FEFF, U+200C-200F" }],
});

/**
 * Layout raiz — só um visual (claro, estilo Bridgerton/Regência), sem
 * alternância claro/escuro (ver docs/architecture/adr/0001-origem-design-system.md).
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${italianno.variable} ${cardo.variable} ${arefRuqaa.variable} ${amiri.variable} ${signature.variable}`}>
      <body className="min-h-screen bg-page font-body text-text-primary">{children}</body>
    </html>
  );
}
