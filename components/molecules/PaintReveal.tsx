"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export interface PaintRevealProps {
  children: ReactNode;
  className?: string;
  /** Atraso (ms) depois de entrar na tela — pra texto aparecer depois da tinta. */
  delay?: number;
  /** "paint": a tinta se espalha revelando (ilustrações). "rise": sobe e aparece (texto). */
  variant?: "paint" | "rise";
  style?: CSSProperties;
}

/**
 * Molecule `PaintReveal` — revela o conteúdo uma única vez, quando ele entra
 * na tela. No modo "paint" o conteúdo aparece como uma mancha de aquarela se
 * espalhando (máscara em sprite, ver `.paint-reveal` em app/globals.css);
 * no modo "rise" ele só sobe e aparece de leve.
 *
 * Sem JavaScript, ou com `prefers-reduced-motion`, o conteúdo aparece
 * direto, sem animação (ver globals.css).
 */
export function PaintReveal({ children, className, delay = 0, variant = "paint", style }: PaintRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.3, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={[variant === "paint" ? "paint-reveal" : "rise-reveal", className].filter(Boolean).join(" ")}
      data-shown={shown ? "" : undefined}
      style={{ ...style, animationDelay: `${delay}ms`, transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
