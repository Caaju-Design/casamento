/**
 * Resolvedor dos tokens de design (formato DTCG) descritos em
 * docs/design-system/tokens/*.tokens.json.
 *
 * Em vez de gerar um artefato intermediário (CSS ou JS) num passo de build
 * separado, este módulo lê e resolve os três arquivos em tempo de
 * carregamento do módulo (tanto no runtime da aplicação quanto na leitura
 * do `tailwind.config.ts`) — é o caminho mais simples dado o prazo curto do
 * projeto (ver docs/architecture/adr/0001-origem-design-system.md).
 *
 * Camadas, na ordem em que devem ser resolvidas:
 *  1. primitivos.tokens.json  — valores concretos (cores, tipografia, espaçamento)
 *  2. semanticos.tokens.json  — referencia primitivos por caminho, ex. "{color.cream.50}"
 *  3. componentes.tokens.json — referencia semânticos e/ou primitivos
 */
import primitivos from "../../docs/design-system/tokens/primitivos.tokens.json";
import semanticos from "../../docs/design-system/tokens/semanticos.tokens.json";
import componentes from "../../docs/design-system/tokens/componentes.tokens.json";

type TokenTree = {
  [key: string]: { $value: unknown; $type?: string } | TokenTree;
};

function isTokenLeaf(node: unknown): node is { $value: unknown; $type?: string } {
  return typeof node === "object" && node !== null && "$value" in node;
}

/** Achata uma árvore de tokens DTCG em um dicionário `"a.b.c" -> valor bruto`. */
function flatten(tree: TokenTree, prefix: string[] = [], out: Record<string, unknown> = {}) {
  for (const key of Object.keys(tree)) {
    const node = tree[key];
    const path = [...prefix, key];
    if (isTokenLeaf(node)) {
      out[path.join(".")] = node.$value;
    } else if (node && typeof node === "object") {
      flatten(node as TokenTree, path, out);
    }
  }
  return out;
}

const REFERENCE_RE = /^\{(.+)\}$/;

/** Resolve todas as referências `{caminho.para.token}` de um dicionário achatado. */
function resolveAll(flat: Record<string, unknown>): Record<string, string> {
  const resolved: Record<string, string> = {};

  function resolveOne(key: string, seen: Set<string>): string {
    if (resolved[key] !== undefined) return resolved[key];
    if (seen.has(key)) {
      throw new Error(`Referência circular de token de design em "${key}"`);
    }
    const raw = flat[key];
    if (raw === undefined) {
      throw new Error(`Token de design não encontrado: "${key}"`);
    }
    if (typeof raw === "string") {
      const match = raw.match(REFERENCE_RE);
      const referencedKey = match?.[1];
      if (referencedKey) {
        const value = resolveOne(referencedKey, new Set(seen).add(key));
        resolved[key] = value;
        return value;
      }
    }
    const value = String(raw);
    resolved[key] = value;
    return value;
  }

  for (const key of Object.keys(flat)) {
    resolveOne(key, new Set());
  }
  return resolved;
}

const flatAll = {
  ...flatten(primitivos as TokenTree),
  ...flatten(semanticos as TokenTree),
  ...flatten(componentes as TokenTree),
};

/** Dicionário achatado e totalmente resolvido: `"color.action.primary" -> "#d98a80"`. */
export const resolvedTokens = resolveAll(flatAll);

function token(path: string): string {
  const value = resolvedTokens[path];
  if (value === undefined) {
    throw new Error(`Token de design não encontrado: "${path}"`);
  }
  return value;
}

/** Tokens organizados para consumo direto em componentes React/three.js. */
export const designTokens = {
  color: {
    page: token("color.background.page"),
    surface: token("color.background.surface"),
    accent: token("color.background.accent"),
    textPrimary: token("color.text.primary"),
    textSecondary: token("color.text.secondary"),
    onAccent: token("color.text.onAccent"),
    borderSubtle: token("color.border.subtle"),
    borderFocus: token("color.border.focus"),
    actionPrimary: token("color.action.primary"),
    actionPrimaryHover: token("color.action.primaryHover"),
    actionSecondary: token("color.action.secondary"),
    actionHighlight: token("color.action.highlight"),
    feedbackError: token("color.feedback.error"),
    feedbackSuccess: token("color.feedback.success"),
    blush50: token("color.blush.50"),
    blush100: token("color.blush.100"),
    blush300: token("color.blush.300"),
    blush500: token("color.blush.500"),
    blush700: token("color.blush.700"),
    sage100: token("color.sage.100"),
    sage300: token("color.sage.300"),
    sage500: token("color.sage.500"),
    gold300: token("color.gold.300"),
    gold500: token("color.gold.500"),
    gold700: token("color.gold.700"),
    cream50: token("color.cream.50"),
    cream100: token("color.cream.100"),
    ink700: token("color.ink.700"),
    ink900: token("color.ink.900"),
    white: token("color.white"),
  },
  font: {
    heading: token("font.heading"),
    body: token("font.body"),
    script: token("font.script"),
  },
  fontSize: {
    100: token("fontSize.100"),
    200: token("fontSize.200"),
    400: token("fontSize.400"),
    600: token("fontSize.600"),
    800: token("fontSize.800"),
  },
  spacing: {
    100: token("space.100"),
    200: token("space.200"),
    400: token("space.400"),
    600: token("space.600"),
    800: token("space.800"),
    sectionGap: token("spacing.sectionGap"),
    cardPadding: token("spacing.cardPadding"),
    fieldGap: token("spacing.fieldGap"),
  },
  radius: {
    sm: token("radius.200"),
    md: token("radius.400"),
    full: token("radius.full"),
    card: token("radius.card"),
    control: token("radius.control"),
    pill: token("radius.pill"),
  },
  component: {
    buttonPrimaryBackground: token("button.primary.background"),
    buttonPrimaryBackgroundHover: token("button.primary.backgroundHover"),
    buttonPrimaryText: token("button.primary.text"),
    buttonPrimaryRadius: token("button.primary.radius"),
    buttonSecondaryBackground: token("button.secondary.background"),
    buttonSecondaryBorder: token("button.secondary.border"),
    buttonSecondaryText: token("button.secondary.text"),
    buttonSecondaryRadius: token("button.secondary.radius"),
    inputBackground: token("input.background"),
    inputBorder: token("input.border"),
    inputBorderFocus: token("input.borderFocus"),
    inputText: token("input.text"),
    inputRadius: token("input.radius"),
    cardBackground: token("card.background"),
    cardBorder: token("card.border"),
    cardRadius: token("card.radius"),
    cardPadding: token("card.padding"),
    giftCardBackground: token("giftCard.background"),
    giftCardAccent: token("giftCard.accent"),
    giftCardRadius: token("giftCard.radius"),
  },
} as const;
