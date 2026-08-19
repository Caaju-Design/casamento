import { forwardRef, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

/** Atom `Input` — usado no formulário de RSVP (nome, e-mail, telefone). */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { hasError = false, className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={[
        "w-full rounded-control border bg-surface px-4 py-3 font-body text-200 text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-border-focus",
        hasError ? "border-feedback-error" : "border-border-subtle",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-invalid={hasError || undefined}
      {...rest}
    />
  );
});
