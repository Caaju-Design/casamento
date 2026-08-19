import type { ElementType, HTMLAttributes, ReactNode } from "react";

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4";
  size?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
}

const SIZE_CLASSES: Record<NonNullable<HeadingProps["size"]>, string> = {
  sm: "text-400",
  md: "text-600",
  lg: "text-800",
  xl: "text-800 md:text-[5rem]",
};

/** Atom `Heading` — tipografia de destaque (fonte "display") em todas as seções. */
export function Heading({ as = "h2", size = "md", children, className, ...rest }: HeadingProps) {
  const Tag = as as ElementType;
  return (
    <Tag
      className={["font-display text-text-primary", SIZE_CLASSES[size], className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </Tag>
  );
}
