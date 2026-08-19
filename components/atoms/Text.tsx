import type { ElementType, HTMLAttributes, ReactNode } from "react";

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  as?: "p" | "span";
  tone?: "primary" | "secondary" | "error" | "success";
  children: ReactNode;
}

const TONE_CLASSES: Record<NonNullable<TextProps["tone"]>, string> = {
  primary: "text-text-primary",
  secondary: "text-text-secondary",
  error: "text-feedback-error",
  success: "text-feedback-success",
};

/** Atom `Text` — corpo de texto (fonte "body") em todas as seções. */
export function Text({ as = "p", tone = "primary", children, className, ...rest }: TextProps) {
  const Tag = as as ElementType;
  return (
    <Tag className={["font-body text-200", TONE_CLASSES[tone], className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </Tag>
  );
}
