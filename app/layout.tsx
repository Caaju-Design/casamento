import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

/**
 * Tipografia oficial (Google Fonts, licença OFL — ver app/fonts/*-OFL.txt),
 * servida pelo próprio site via next/font/local: sem pedido a servidor de
 * fonte de terceiro, com preload e sem "pulo" de layout.
 *  - Questrial → títulos e textos da história (fontFamily.display / script)
 *  - Cinzel    → textos, subtítulos e menu (fontFamily.body), variável 400–900
 * Só o subconjunto latino (cobre todos os acentos do português).
 * Os nomes das variáveis CSS espelham docs/design-system/tokens/primitivos.tokens.json.
 */
const questrial = localFont({
  src: "./fonts/questrial-latin-400.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-questrial",
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});
const cinzel = localFont({
  src: "./fonts/cinzel-latin-wght.woff2",
  weight: "400 900",
  style: "normal",
  variable: "--font-cinzel",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const metadata: Metadata = {
  title: "Gabriela & Emanuel — Nosso casamento",
  description: "Confirme presença, envie uma foto ou mensagem e conheça os detalhes da nossa celebração.",
};

/**
 * Layout raiz — só um visual (claro, estilo Bridgerton/Regência), sem
 * alternância claro/escuro (ver docs/architecture/adr/0001-origem-design-system.md).
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${questrial.variable} ${cinzel.variable}`}>
      <body className="min-h-screen bg-page font-body text-text-primary">{children}</body>
    </html>
  );
}
