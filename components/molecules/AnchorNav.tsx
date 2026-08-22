"use client";

import { useState, type CSSProperties } from "react";
import { Icon } from "@/components/atoms/Icon";

export interface AnchorNavItem {
  href: string;
  label: string;
}

export interface AnchorNavProps {
  items: AnchorNavItem[];
  /**
   * Passar `true` só quando este nav for renderizado logo acima de
   * `HeroSection` (ver `HomePageTemplate`) — muda o *fallback* CSS de
   * `--hero-reveal`/`--hero-reveal-pointer-events` de "visível" (1/auto)
   * pra "invisível" (0/none).
   *
   * Por quê o fallback importa tanto aqui: `HeroSection` só escreve essas
   * variáveis via JavaScript (`useLayoutEffect`), e isso só roda DEPOIS que
   * o React hidrata no navegador. O HTML que já chega renderizado do
   * servidor (e o primeiro paint do navegador, antes do JS terminar de
   * carregar) não tem ideia de qual deveria ser o fallback — ele já pinta
   * a tela usando o valor de fallback do `var()`. Com fallback 1/auto (o
   * padrão, pensado pra páginas sem hero), esse primeiro paint mostrava o
   * menu branco por cima do vídeo por uma fração de segundo antes do JS
   * assumir — exatamente o "barra branca aparecendo no início" reportado.
   * Com `startHiddenForHero`, o fallback já nasce invisível, então o
   * primeiro paint (foco 100% no vídeo) já sai correto, sem esperar JS
   * nenhum.
   */
  startHiddenForHero?: boolean;
}

/**
 * Molecule `AnchorNav` (menu de âncoras) — topo da página one-page.
 *
 * Quando renderizado logo acima de `HeroSection` (ver `HomePageTemplate`,
 * com `startHiddenForHero`), fica invisível e não-clicável durante toda a
 * rolagem do vídeo do hero, aparecendo só no fim dele — lendo
 * `--hero-reveal` / `--hero-reveal-pointer-events`, que `HeroSection`
 * escreve em `document.documentElement` (por herança de CSS, funciona
 * mesmo os dois sendo irmãos no DOM, não pai/filho). Sem
 * `startHiddenForHero`, os fallbacks (`1` / `auto`) mantêm o menu sempre
 * visível e clicável em qualquer página sem hero acima dele (ex.:
 * `/convite/[token]`), onde essas variáveis nunca são setadas.
 */
export function AnchorNav({ items, startHiddenForHero = false }: AnchorNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-30 flex items-center justify-between bg-page/95 px-6 py-4 backdrop-blur transition-opacity duration-300"
      style={{
        opacity: startHiddenForHero ? "var(--hero-reveal, 0)" : "var(--hero-reveal, 1)",
        pointerEvents: (startHiddenForHero
          ? "var(--hero-reveal-pointer-events, none)"
          : "var(--hero-reveal-pointer-events, auto)") as CSSProperties["pointerEvents"],
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
