"use client";

import { useState } from "react";
import { Icon } from "@/components/atoms/Icon";

export interface AnchorNavItem {
  href: string;
  label: string;
}

export interface AnchorNavProps {
  items: AnchorNavItem[];
}

/** Molecule `AnchorNav` (menu de âncoras) — topo da página one-page. */
export function AnchorNav({ items }: AnchorNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-30 flex items-center justify-between bg-page/95 px-6 py-4 backdrop-blur">
      <a href="#topo" className="font-display text-400 text-text-primary">
        Emanuel &amp; Gabriela
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
