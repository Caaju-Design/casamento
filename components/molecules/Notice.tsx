import type { ReactNode } from "react";

/**
 * Molecule `Notice` — aviso com ícone redondo à esquerda, título em caixa
 * alta terracota e texto. Usado nos cards "Importante" (Onde será) e
 * "Bom saber" (Onde ficar e aproveitar), que dividem o mesmo visual:
 * fundo pêssego, borda terracota clara e a pílula do rótulo no topo.
 */

export function IconAlert() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.4v.1" />
    </svg>
  );
}

export function Notice({ icon, title, text }: { icon: ReactNode; title: string; text: ReactNode }) {
  return (
    <div className="flex items-start gap-4 text-start">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-page text-terracota-700 shadow-[0_6px_16px_-10px_rgba(152,75,44,0.7)]">
        {icon}
      </span>
      <div>
        <h3 className="font-body text-100 font-bold uppercase tracking-[0.2em] text-terracota-700">{title}</h3>
        <p className="mt-1.5 font-body text-200 leading-relaxed text-text-primary">{text}</p>
      </div>
    </div>
  );
}

/** Card de avisos: pílula com o rótulo no topo (centralizada no celular, à esquerda no desktop) e a lista de `Notice`. */
export function NoticeCard({ label, icon, children, className = "" }: { label: string; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={["relative rounded-[1.75rem] border border-terracota-200 bg-pessego-50/80 px-6 pb-6 pt-8 text-start md:px-7", className].join(" ")}>
      <span className="absolute -top-3.5 start-1/2 inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-pill bg-terracota-500 px-4 py-1.5 font-body text-100 font-bold uppercase tracking-[0.2em] text-white rtl:translate-x-1/2 md:start-6 md:translate-x-0 md:rtl:translate-x-0">
        {icon ?? <IconAlert />} {label}
      </span>
      <div className="grid gap-6">{children}</div>
    </div>
  );
}
