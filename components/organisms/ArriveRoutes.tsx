"use client";

import { useState } from "react";
import { MetroRoute } from "@/components/molecules/MetroRoute";
import { Notice, NoticeCard } from "@/components/molecules/Notice";
import { ARRIVAL_IDS, type ArrivalId } from "@/lib/content/metro";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Organism `ArriveRoutes` — o card "Como você vai chegar?": seletor no topo
 * (Congonhas, Guarulhos ou Rodoviária do Tietê) e, embaixo, o passo a passo
 * à esquerda + o mapa pintado das linhas (`MetroRoute`) à direita. No
 * celular, um embaixo do outro. Começa em Congonhas (o aeroporto mais perto).
 */

const body = "font-body text-200 leading-relaxed text-text-secondary";

/** "i" do rótulo Bom saber. */
const INFO = (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5M12 7.6v.1" />
  </svg>
);

/** Ícones dos avisos "Importante" (mesmo traço dos do Onde será). */
const ALERT_ICON = {
  clock: (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  ),
  ticket: (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5V10a2 2 0 0 0 0 4v2.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5V14a2 2 0 0 0 0-4z" />
      <path d="M14.5 6v12" strokeDasharray="1.5 2" />
    </svg>
  ),
  car: (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 16V11.5L7 6.8A2 2 0 0 1 8.8 5.6h6.4A2 2 0 0 1 17 6.8l2 4.7V16" />
      <path d="M3.5 16h17M4.5 11.5h15" />
      <circle cx="7.5" cy="16.5" r="1.7" />
      <circle cx="16.5" cy="16.5" r="1.7" />
    </svg>
  ),
};

function TabIcon({ kind }: { kind: ArrivalId }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      {kind === "tiete" ? (
        <>
          <rect x="5" y="3.5" width="14" height="14" rx="2.5" />
          <path d="M5 11h14M8 17.5v2M16 17.5v2" />
        </>
      ) : (
        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
      )}
    </svg>
  );
}

export function ArriveRoutes({ t }: { t: Dictionary["stay"]["arrival"] }) {
  const [sel, setSel] = useState<ArrivalId>("congonhas");
  const r = t.routes[sel];

  const tab = (active: boolean) =>
    [
      "inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-pill px-4 font-body text-100 transition-colors shadow-[0_6px_16px_-10px_rgba(152,75,44,0.7)]",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
      active ? "bg-terracota-700 text-white" : "bg-page text-text-primary hover:text-terracota-700",
    ].join(" ");

  return (
    <div>
      {/* seletor: por onde a pessoa chega */}
      <div className="text-center">
        {/* o título "Como você vai chegar?" saiu (pedido do Manu); segue como rótulo do seletor pra leitor de tela */}
        <p className={`${body} mx-auto max-w-2xl`}>{t.lead}</p>
      </div>
      <div
        role="tablist"
        aria-label={t.question}
        className="-mx-6 mt-6 flex gap-2 overflow-x-auto px-6 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0"
      >
        {ARRIVAL_IDS.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`chegada-tab-${id}`}
            aria-selected={sel === id}
            aria-controls="chegada-painel"
            onClick={() => setSel(id)}
            className={tab(sel === id)}
          >
            <TabIcon kind={id} />
            {t.tabs[id]}
          </button>
        ))}
      </div>

      {/* passo a passo + mapa das linhas */}
      <div
        id="chegada-painel"
        role="tabpanel"
        aria-labelledby={`chegada-tab-${sel}`}
        className="mt-6 grid gap-8 rounded-card bg-page p-6 shadow-[0_14px_34px_-22px_rgba(152,75,44,0.6)] sm:p-7 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-12 md:p-10"
      >
        <div>
          <h4 className="font-body text-400 font-bold leading-tight text-text-primary">{r.title}</h4>
          <p className={`${body} mt-2`}>{r.lead}</p>
          <ol className={`${body} mt-5 space-y-3`}>
            {r.steps.map((s, i) => (
              <li key={s} className="flex gap-3">
                <span aria-hidden="true" className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-salvia-500/25 font-body text-100 font-bold text-salvia-800">
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 inline-flex items-center gap-2 rounded-pill bg-salvia-50 px-4 py-2 font-body text-100 font-bold text-salvia-800">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            {r.time}
          </p>
          {r.tip && <p className="mt-4 font-body text-100 leading-relaxed text-text-secondary">{r.tip}</p>}
          {r.alerts && r.alerts.length > 0 && (
            <NoticeCard label={t.importantLabel} className="mt-9">
              {r.alerts.map((a) => (
                <Notice key={a.title} icon={ALERT_ICON[a.icon]} title={a.title} text={a.text} />
              ))}
            </NoticeCard>
          )}
          {r.notes && r.notes.length > 0 && (
            <NoticeCard label={t.goodLabel} icon={INFO} className="mt-9">
              {r.notes.map((a) => (
                <Notice key={a.title} icon={ALERT_ICON[a.icon]} title={a.title} text={a.text} />
              ))}
            </NoticeCard>
          )}
        </div>
        <MetroRoute key={sel} arrival={sel} t={t.metro} origin={r.origin} originSub={r.originSub} />
      </div>
    </div>
  );
}
