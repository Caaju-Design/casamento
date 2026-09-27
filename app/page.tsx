import type { Metadata } from "next";
import { HomePageTemplate } from "@/components/templates/HomePageTemplate";

export const metadata: Metadata = {
  alternates: { languages: { "pt-BR": "/", en: "/en", ar: "/ar" } },
};

export default function HomePage() {
  return <HomePageTemplate locale="pt" />;
}
