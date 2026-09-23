import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gabriela & Emanuel — Nosso casamento",
  description: "Confirme presença, envie uma foto ou mensagem e conheça os detalhes da nossa celebração.",
};

/**
 * Layout raiz — só um visual (claro, estilo Bridgerton/Regência), sem
 * alternância claro/escuro (ver docs/architecture/adr/0001-origem-design-system.md).
 * As fontes (Cochin LT Pro / Museo Sans, via Adobe Fonts) espelham
 * docs/design-system/tokens/primitivos.tokens.json (fontFamily.display/body).
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {/*
          Tipografia oficial do casamento via kit web do Adobe Fonts
          (kit "Casamento Gabriela & Emanuel", id wjw8qvm, liberado pra
          casamento.caaju.com.br, *.vercel.app e localhost — gerenciar em
          fonts.adobe.com/my_fonts#web_projects-section):
            - Cochin LT Pro  → "cochin-lt-pro" (títulos, fontFamily.display)
            - Museo Sans     → "museo-sans"    (textos e subtítulos, fontFamily.body)
          Os nomes CSS espelham docs/design-system/tokens/primitivos.tokens.json.
        */}
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://p.typekit.net" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://use.typekit.net/wjw8qvm.css" />
      </head>
      <body className="min-h-screen bg-page font-body text-text-primary">{children}</body>
    </html>
  );
}
