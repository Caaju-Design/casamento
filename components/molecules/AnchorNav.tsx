"use client";

import { useState, type CSSProperties } from "react";
import { Icon } from "@/components/atoms/Icon";

export interface AnchorNavItem {
  href: string;
  label: string;
}

export interface AnchorNavProps {
  items: AnchorNavItem[];
}

/**
 * Molecule `AnchorNav` (menu de âncoras) — topo da página one-page.
 *
 * Quando renderizado logo acima de `HeroSection` (ver `HomePageTemplate`),
 * fica invisível e não-clicável durante toda a rolagem do vídeo do hero,
 * aparecendo só no fim dele — lendo `--hero-reveal` /
 * `--hero-reveal-pointer-events`, que `HeroSection` escreve em
 * `document.documentElement` (por herança de CSS, funciona mesmo os dois
 * sendo irmãos no DOM, não pai/filho). Os valores de fallback (`1` / `auto`)
 * mantêm o menu sempre visível e clicável em qualquer página sem hero acima
 * dele (ex.: `/convite/[token]`), onde essas variáveis nunca são setadas.
 */
export function AnchorNav({ items }: AnchorNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-30 flex items-center justify-between bg-page/95 px-6 py-4 backdrop-blur transition-opacity duration-300"
      style={{
        opacity: "var(--hero-reveal, 1)",
        pointerEvents: "var(--hero-reveal-pointer-events, auto)" as CSSProperties["pointerEvents"],
      }}
    >
      <a href="#topo" className="font-display text-400 text-text-primary">
        Gabriela &amp; Emanuel
      </a>
      <button
        type="button"
        className="text-text-primary md:hidden"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label="Abrir menu"
      >
        <Icon name="menu" />
      </button>
      <ul
        className={[
          "font-body text-100 gap-6 md:flex md:items-center",
          isOpen ? "absolute left-0 right-0 top-full flex flex-col bg-surface p-4" : "hidden",
        ].join(" ")}
      >
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="block py-2 text-text-secondary hover:text-action-primary"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
