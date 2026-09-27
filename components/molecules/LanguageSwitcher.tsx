"use client";

import { useEffect, useRef, useState } from "react";
import { LOCALES, type Locale } from "@/lib/i18n/dictionaries";

/**
 * Molecule `LanguageSwitcher` — seletor de idioma do topo (Português,
 * English, العربية). Cada idioma é uma rota ("/", "/en", "/ar"); ao trocar,
 * mantém a seção em que a pessoa estava (#hash).
 */
export function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LOCALES.find((l) => l.id === locale)!;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`${label}: ${current.name}`}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-pill px-3 font-body text-100 tracking-[0.12em] text-text-secondary transition-colors hover:text-action-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-border-focus"
      >
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
        </svg>
        <span>{current.short}</span>
        <span aria-hidden="true" className={["text-[0.6rem] transition-transform", open ? "rotate-180" : ""].join(" ")}>
          ▾
        </span>
      </button>
      {open && (
        <ul className="absolute end-0 top-full z-40 mt-1 min-w-[10rem] overflow-hidden rounded-card border border-caramelo-100 bg-page py-1 shadow-[0_12px_30px_-18px_rgba(45,43,35,0.5)]">
          {LOCALES.map((l) => (
            <li key={l.id}>
              <a
                href={l.href}
                hrefLang={l.lang}
                lang={l.lang}
                aria-current={l.id === locale ? "true" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = l.href + window.location.hash;
                }}
                className={[
                  "flex items-center justify-between gap-4 px-4 py-2.5 font-body text-200 hover:bg-salvia-50",
                  l.id === locale ? "text-text-primary" : "text-text-secondary",
                ].join(" ")}
              >
                <span>{l.name}</span>
                {l.id === locale && <span aria-hidden="true">✓</span>}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
