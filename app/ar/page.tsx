import type { Metadata } from "next";
import { HomePageTemplate } from "@/components/templates/HomePageTemplate";
import { getDictionary } from "@/lib/i18n/dictionaries";

const t = getDictionary("ar");

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
  alternates: { canonical: "/ar", languages: { "pt-BR": "/", en: "/en", ar: "/ar" } },
};

/** Home em árabe (da direita pra esquerda). */
export default function HomePageAr() {
  return <HomePageTemplate locale="ar" />;
}
