import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  isLoading?: boolean;
  children: ReactNode;
}

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-pill px-6 py-3 font-body text-200 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-action-primary text-on-accent hover:bg-action-primary-hover",
  secondary: "bg-surface text-text-primary border border-border-subtle hover:bg-blush-50",
};

/** Atom `Button` — usado no RSVP, upload e navegação de âncora. */
export function Button({
  variant = "primary",
  isLoading = false,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={[BASE_CLASSES, VARIANT_CLASSES[variant], className].filter(Boolean).join(" ")}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
