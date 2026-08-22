import type { Config } from "tailwindcss";
import { designTokens } from "./lib/design-system/tokens";

/**
 * Tema do Tailwind derivado dos tokens DTCG do design system
 * (docs/design-system/tokens/*.tokens.json), via lib/design-system/tokens.ts.
 * Não editar cor/tipografia/espaçamento diretamente aqui — editar os JSONs
 * de token e deixar este arquivo só espelhar o resultado resolvido.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: designTokens.color.page,
        surface: designTokens.color.surface,
        accent: designTokens.color.accent,
        "text-primary": designTokens.color.textPrimary,
        "text-secondary": designTokens.color.textSecondary,
        "on-accent": designTokens.color.onAccent,
        "border-subtle": designTokens.color.borderSubtle,
        "border-focus": designTokens.color.borderFocus,
        "action-primary": designTokens.color.actionPrimary,
        "action-primary-hover": designTokens.color.actionPrimaryHover,
        "action-secondary": designTokens.color.actionSecondary,
        "action-highlight": designTokens.color.actionHighlight,
        "feedback-error": designTokens.color.feedbackError,
        "feedback-success": designTokens.color.feedbackSuccess,
        blush: {
          50: designTokens.color.blush50,
          100: designTokens.color.blush100,
          300: designTokens.color.blush300,
          500: designTokens.color.blush500,
          700: designTokens.color.blush700,
        },
        sage: {
          100: designTokens.color.sage100,
          300: designTokens.color.sage300,
          500: designTokens.color.sage500,
        },
        gold: {
          300: designTokens.color.gold300,
          500: designTokens.color.gold500,
          700: designTokens.color.gold700,
        },
        cream: {
          50: designTokens.color.cream50,
          100: designTokens.color.cream100,
        },
        ink: {
          700: designTokens.color.ink700,
          900: designTokens.color.ink900,
        },
      },
      fontFamily: {
        display: [designTokens.font.heading],
        body: [designTokens.font.body],
        script: [designTokens.font.script],
      },
      fontSize: {
        100: designTokens.fontSize[100],
        200: designTokens.fontSize[200],
        400: designTokens.fontSize[400],
        600: designTokens.fontSize[600],
        800: designTokens.fontSize[800],
      },
      spacing: {
        "section-gap": designTokens.spacing.sectionGap,
        "card-padding": designTokens.spacing.cardPadding,
        "field-gap": designTokens.spacing.fieldGap,
      },
      borderRadius: {
        card: designTokens.radius.card,
        control: designTokens.radius.control,
        pill: designTokens.radius.pill,
      },
    },
  },
  plugins: [],
};

export default config;
