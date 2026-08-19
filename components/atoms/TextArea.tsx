import { forwardRef, type TextareaHTMLAttributes } from "react";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

/** Atom `TextArea` — usado na mensagem/depoimento do convite pessoal. */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { hasError = false, className, ...rest },
  ref,
) {
  return (
    <textarea
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
