"use client";

import { useState, type CSSProperties } from "react";
import { Icon } from "@/components/atoms/Icon";
import { LanguageSwitcher } from "@/components/molecules/LanguageSwitcher";
import type { Locale } from "@/lib/i18n/dictionaries";

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
  /** Idioma da página: mostra o seletor de idioma à direita. Sem ele, não há seletor. */
  locale?: Locale;
  /** Textos do próprio menu (padrão: português). */
  labels?: { openMenu: string; home: string; language: string };
}

const PT_LABELS = { openMenu: "Abrir menu", home: "Gabriela & Emanuel — voltar ao início", language: "Idioma" };

// Altura fixa (em vez de deixar o conteúdo interno definir) — usada tanto
// na própria `<nav>` quanto no "espaçador" abaixo, então os dois batem
// sempre, sem depender de medir nada em runtime.
const NAV_HEIGHT_CLASS = "h-[72px]";

/**
 * Molecule `AnchorNav` (menu de âncoras) — topo da página one-page.
 *
 * `position: fixed` (não `sticky`) DE PROPÓSITO: um elemento `sticky`
 * continua ocupando o próprio espaço no fluxo normal do documento mesmo
 * quando fica com `opacity: 0` — opacidade não tira nada do layout, só
 * esconde visualmente. Isso empurrava a `HeroSection` (o vídeo) pra baixo
 * pela altura do nav mesmo com ele "invisível", deixando uma tarja creme
 * fixa no topo que "nunca saía da tela" — era o próprio nav, só que sem
 * conteúdo visível. `fixed` tira o nav do fluxo de vez: ele passa a
 * flutuar por cima de tudo (dá pra fazer isso porque, visível, ele já tem
 * fundo translúcido com blur — não faz diferença pra ele estar "no
 * documento" ou só "sobrepondo"), então a `HeroSection` agora começa
 * mesmo no topo físico da tela, ocupando o viewport inteiro desde o
 * primeiro pixel.
 *
 * Quando renderizado logo acima de `HeroSection` (ver `HomePageTemplate`,
 * com `startHiddenForHero`), fica invisível e não-clicável durante toda a
 * rolagem do vídeo do hero, aparecendo só no fim dele — lendo
 * `--hero-reveal` / `--hero-reveal-pointer-events`, que `HeroSection`
 * escreve em `document.documentElement` (por herança de CSS, funciona
 * mesmo os dois sendo irmãos no DOM, não pai/filho). Sem
 * `startHiddenForHero`, os fallbacks (`1` / `auto`) mantêm o menu sempre
 * visível e clicável em qualquer página sem hero acima dele (ex.:
 * `/convite/[token]`) — nesse caso, como o nav virou `fixed` e não reserva
 * mais espaço sozinho, um "espaçador" do tamanho dele é renderizado logo
 * abaixo, pra o conteúdo da página não nascer escondido atrás do nav.
 */
export function AnchorNav({ items, startHiddenForHero = false, locale, labels = PT_LABELS }: AnchorNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/*
        Header em 3 colunas: menu à esquerda (hambúrguer abaixo de xl), a
        logo do casal no centro e o seletor de idioma à direita. Em árabe
        (dir="rtl") as colunas se espelham sozinhas.
      */}
      <nav
        className={`fixed inset-x-0 top-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center gap-4 bg-page/95 px-4 backdrop-blur transition-opacity duration-300 md:px-6 ${NAV_HEIGHT_CLASS}`}
        style={{
          opacity: startHiddenForHero ? "var(--hero-reveal, 0)" : "var(--hero-reveal, 1)",
          pointerEvents: (startHiddenForHero
            ? "var(--hero-reveal-pointer-events, none)"
            : "var(--hero-reveal-pointer-events, auto)") as CSSProperties["pointerEvents"],
        }}
      >
        <div className="flex items-center justify-self-start">
          <button
            type="button"
            className="inline-flex min-h-[44px] min-w-[44px] items-center text-text-primary xl:hidden"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-label={labels.openMenu}
          >
            <Icon name="menu" />
          </button>
          <ul
            className={[
              "font-body text-100 xl:flex xl:items-center xl:gap-5",
              isOpen
                ? "absolute inset-x-0 top-full flex flex-col border-b border-caramelo-100 bg-page px-6 py-3 shadow-[0_12px_30px_-20px_rgba(45,43,35,0.5)]"
                : "hidden",
            ].join(" ")}
          >
            {items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="block whitespace-nowrap py-2 text-text-secondary hover:text-action-primary"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* só a logo do casal, no centro (sem os nomes escritos) */}
        <a href="#topo" aria-label={labels.home} className="flex items-center justify-self-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-ge.svg" alt="" width={470} height={401} className="h-11 w-auto" />
        </a>

        <div className="flex items-center justify-self-end">
          {locale && <LanguageSwitcher locale={locale} label={labels.language} />}
        </div>
      </nav>
      {/*
        Espaçador — só existe quando o nav é sempre visível (páginas sem
        hero acima dele). Na home ele NÃO é renderizado: a HeroSection
        precisa ocupar o viewport inteiro desde o topo, sem sobra nenhuma
        reservada pro nav (que ali começa invisível mesmo).
      */}
      {startHiddenForHero ? null : <div aria-hidden="true" className={NAV_HEIGHT_CLASS} />}
    </>
  );
}
