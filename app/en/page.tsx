import type { Metadata } from "next";
import { HomePageTemplate } from "@/components/templates/HomePageTemplate";
import { getDictionary } from "@/lib/i18n/dictionaries";

const t = getDictionary("en");

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
  alternates: { canonical: "/en", languages: { "pt-BR": "/", en: "/en", ar: "/ar" } },
};

/** Home em inglês. */
export default function HomePageEn() {
  return <HomePageTemplate locale="en" />;
}
