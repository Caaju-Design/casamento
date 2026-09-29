"use client";

import { useState, type CSSProperties } from "react";
import { LanguageSwitcher } from "@/components/molecules/LanguageSwitcher";
import type { Locale } from "@/lib/i18n/dictionaries";

export interface AnchorNavItem {
  href: string;
  label: string;
  /** Pula direto pra seção (sem rolagem suave), pros itens lá do fim da página. */
  instant?: boolean;
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
        Header em 3 colunas: botão hambúrguer à esquerda (em TODAS as telas,
        pedido do Manu), a logo do casal no centro e o seletor de idioma à
        direita. Ao abrir, o menu aparece logo abaixo da logo, centralizado:
        no desktop os itens ficam lado a lado; no celular, um embaixo do
        outro. Em árabe (dir="rtl") as colunas se espelham sozinhas.
        Efeito VIDRO (pedido do Manu): fundo linho translúcido (45%) com
        backdrop-blur + saturação, fio claro embaixo — dá pra ver o
        conteúdo passando por baixo, embaçado.
      */}
      <nav
        className={`fixed inset-x-0 top-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 transition-opacity duration-300 md:px-6 ${NAV_HEIGHT_CLASS}`}
        style={{
          opacity: startHiddenForHero ? "var(--hero-reveal, 0)" : "var(--hero-reveal, 1)",
          pointerEvents: (startHiddenForHero
            ? "var(--hero-reveal-pointer-events, none)"
            : "var(--hero-reveal-pointer-events, auto)") as CSSProperties["pointerEvents"],
        }}
      >
        {/*
          Camada de vidro num elemento próprio (e não no <nav>): um elemento
          com backdrop-filter vira "raiz" do backdrop dos filhos, e aí o
          painel do menu aberto não conseguiria embaçar a página por baixo.
        */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 border-b border-white/40 bg-page/45 shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_10px_30px_-24px_rgba(45,43,35,0.45)] backdrop-blur-xl backdrop-saturate-150"
        />
        <div className="flex items-center justify-self-start">
          <button
            type="button"
            className="inline-flex min-h-[44px] min-w-[44px] items-center text-text-primary"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-label={labels.openMenu}
          >
            {/* hambúrguer → X: as 3 barras se animam (a do meio some, as outras giram e cruzam) */}
            <span aria-hidden="true" className="relative block h-4 w-6">
              <span className={["absolute left-0 top-0 h-[1.5px] w-6 rounded-full bg-current transition-transform duration-300 ease-out", isOpen ? "translate-y-[7px] rotate-45" : ""].join(" ")} />
              <span className={["absolute left-0 top-[7px] h-[1.5px] w-6 rounded-full bg-current transition-[opacity,transform] duration-200 ease-out", isOpen ? "scale-x-0 opacity-0" : ""].join(" ")} />
              <span className={["absolute left-0 top-[14px] h-[1.5px] w-6 rounded-full bg-current transition-transform duration-300 ease-out", isOpen ? "-translate-y-[7px] -rotate-45" : ""].join(" ")} />
            </span>
          </button>
          <ul
            className={[
              "font-body text-100",
              "absolute inset-x-0 top-full flex origin-top flex-col items-center border-b border-white/40 bg-page/70 px-6 py-3 text-center shadow-[0_12px_30px_-20px_rgba(45,43,35,0.5)] backdrop-blur-xl backdrop-saturate-150 md:flex-row md:flex-wrap md:justify-center md:gap-x-8 md:py-2",
              // abre/fecha sempre com animação suave (desce e aparece / sobe e some)
              "transition-[opacity,transform,visibility] duration-300 ease-out motion-reduce:transition-none",
              isOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0",
            ].join(" ")}
          >
            {items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="block whitespace-nowrap py-2 text-text-secondary hover:text-action-primary"
                  onClick={(e) => {
                    setIsOpen(false);
                    if (!item.instant || !item.href.startsWith("#")) return;
                    const target = document.getElementById(item.href.slice(1));
                    if (!target) return;
                    e.preventDefault();
                    target.scrollIntoView({ behavior: "instant", block: "start" });
                    history.replaceState(null, "", item.href);
                  }}
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
