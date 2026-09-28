import type { Metadata } from "next";
import { EmbeddedPageTemplate, cropFromParam } from "@/components/templates/EmbeddedPageTemplate";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Lista de presentes — Gabriela & Emanuel",
  description: "Presenteie os noivos: a lista de presentes de Gabriela & Emanuel.",
};

/** Endereço da lista (site da assessoria). */
const LIST_URL = "https://www.gabrielaemanuel.com.br/lista-de-presentes";

/** Altura do cabeçalho do site da assessoria que fica escondida. Calibrar: /presentes?corte=90 */
const CROP = { mobile: 64, desktop: 64 };

type Props = { searchParams: Promise<{ corte?: string; lang?: string }> };

export default async function GiftListPage({ searchParams }: Props) {
  const { corte, lang } = await searchParams;
  const locale: Locale = lang === "en" || lang === "ar" ? lang : "pt";
  const t = getDictionary(locale).gift;
  return <EmbeddedPageTemplate locale={locale} src={LIST_URL} backHref="#presentes" crop={cropFromParam(corte, CROP)} labels={t} />;
}
