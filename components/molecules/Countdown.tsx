"use client";

import { useEffect, useState } from "react";

/**
 * Molecule `Countdown` — contagem regressiva pro casamento, acima do
 * "Reserve a data": "Faltam X dias" até a véspera e "É hoje!" no dia
 * 17/04/2027. Depois do dia, não mostra nada.
 *
 * O dia é contado no fuso de São Paulo (onde é a festa), não no fuso de
 * quem está vendo. Calculado só no navegador (depois de montar), pra o HTML
 * do servidor — gerado em outro dia — não ficar com um número velho; até
 * lá, ocupa o mesmo espaço sem texto, pra nada "pular" na tela.
 */

const WEDDING = Date.UTC(2027, 3, 17);
const DAY = 86_400_000;

export interface CountdownLabels {
  /** [antes, depois] do número quando faltam 2+ dias. */
  many: [string, string];
  /** [antes, depois] do número quando falta 1 dia. */
  one: [string, string];
  today: string;
}

/** Dias que faltam pro casamento, contando o "hoje" de São Paulo (0 = é hoje). */
export function daysLeft(now = new Date()): number {
  // data de hoje em São Paulo, como AAAA-MM-DD
  const [y = 0, m = 1, d = 1] = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" })
    .format(now)
    .split("-")
    .map(Number);
  return Math.round((WEDDING - Date.UTC(y, m - 1, d)) / DAY);
}

export function Countdown({ labels, className }: { labels: CountdownLabels; className?: string }) {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setDays(daysLeft());
    tick();
    const id = window.setInterval(tick, 60_000); // vira o dia sem recarregar
    return () => window.clearInterval(id);
  }, []);

  if (days !== null && days < 0) return null;

  const base = ["flex min-h-[3.5rem] flex-wrap items-baseline gap-x-3 gap-y-1", className].filter(Boolean).join(" ");
  const small = "font-body text-100 font-bold uppercase tracking-[0.24em] text-terracota-700";
  const big = "font-body font-bold leading-none text-text-title";

  if (days === null) return <p aria-hidden="true" className={base} />;

  if (days === 0) {
    return (
      <p className={base} role="status">
        <span className={big} style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.4rem)" }}>
          {labels.today}
        </span>
      </p>
    );
  }

  const [before, after] = days === 1 ? labels.one : labels.many;
  return (
    <p className={base}>
      {before && <span className={small}>{before}</span>}
      <span className={big} style={{ fontSize: "clamp(2.8rem, 5vw, 3.8rem)" }}>
        {days}
      </span>
      <span className={small}>{after}</span>
    </p>
  );
}
