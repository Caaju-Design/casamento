import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gabriela & Emanuel — Nosso casamento",
  description: "Confirme presença, envie uma foto ou mensagem e conheça os detalhes da nossa celebração.",
};

/**
 * Layout raiz — só um visual (claro, estilo Bridgerton/Regência), sem
 * alternância claro/escuro (ver docs/architecture/adr/0001-origem-design-system.md).
 * As fontes (Cormorant Garamond / Lora) espelham
 * docs/design-system/tokens/primitivos.tokens.json (fontFamily.display/body).
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/*
          Carregamento de fonte externa via <link> no layout raiz do App
          Router — a regra abaixo é voltada ao Pages Router
          (pages/_document.js), onde esse padrão carregaria a fonte só numa
          página; aqui o layout já é global.
          Ver https://nextjs.org/docs/app/getting-started/fonts#google-fonts.
        */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Lora:ital,wght@0,400;0,500;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-page font-body text-text-primary">{children}</body>
    </html>
  );
}
