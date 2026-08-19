import type { SVGAttributes } from "react";

export type IconName = "heart" | "check" | "error" | "camera" | "gift" | "menu";

export interface IconProps extends SVGAttributes<SVGSVGElement> {
  name: IconName;
  size?: number;
}

const PATHS: Record<IconName, string> = {
  heart: "M12 21s-7.5-4.6-10-9.1C.5 8.6 2 5 5.5 5 8 5 9.6 6.6 12 9c2.4-2.4 4-4 6.5-4C22 5 23.5 8.6 22 11.9 19.5 16.4 12 21 12 21z",
  check: "M20 6 9 17l-5-5",
  error: "M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z",
  camera:
    "M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Zm8 3.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z",
  gift: "M12 8v13M4 8h16v5H4V8Zm0 5h16v8H4v-8ZM8 8a2.5 2.5 0 1 1 4-3 2.5 2.5 0 1 1 4 3",
  menu: "M4 6h16M4 12h16M4 18h16",
};

/** Atom `Icon` — usado no menu e nos estados de feedback (erro, sucesso). */
export function Icon({ name, size = 24, className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
