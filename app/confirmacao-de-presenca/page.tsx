import type { Metadata } from "next";
import { EmbeddedPageTemplate, cropFromParam } from "@/components/templates/EmbeddedPageTemplate";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Confirmação de presença — Gabriela & Emanuel",
  description: "Confirme sua presença no casamento de Gabriela & Emanuel.",
};

/** Formulário de confirmação (site da assessoria). */
const RSVP_URL = "https://www.gabrielaemanuel.com.br/confirmacao-de-presenca";

/** Mesmo cabeçalho da assessoria da lista de presentes. Calibrar: /confirmacao-de-presenca?corte=90 */
const CROP = { mobile: 64, desktop: 64 };

type Props = { searchParams: Promise<{ corte?: string; lang?: string }> };

export default async function RsvpPage({ searchParams }: Props) {
  const { corte, lang } = await searchParams;
  const locale: Locale = lang === "en" || lang === "ar" ? lang : "pt";
  const d = getDictionary(locale);
  return (
    <EmbeddedPageTemplate
      locale={locale}
      src={RSVP_URL}
      backHref="#confirmar"
      crop={cropFromParam(corte, CROP)}
      labels={{ ...d.rsvp, back: d.gift.back, newTab: d.gift.newTab }}
    />
  );
}
