import { Painting } from "@/components/atoms/Painting";
import { AnchorNav } from "@/components/molecules/AnchorNav";
import { DressCodeSection } from "@/components/organisms/DressCodeSection";
import { EventSection } from "@/components/organisms/EventSection";
import { GiftSection } from "@/components/organisms/GiftSection";
import { HeroSection } from "@/components/organisms/HeroSection";
import { StaySection } from "@/components/organisms/StaySection";
import { StorySection } from "@/components/organisms/StorySection";
import { TipsSection } from "@/components/organisms/TipsSection";

const NAV_ITEMS = [
  { href: "#historia", label: "Nossa história" },
  { href: "#evento", label: "O grande dia" },
  { href: "#dresscode", label: "Dress code" },
  { href: "#presentes", label: "Presentes" },
  { href: "#hospedagem", label: "Hospedagem" },
  { href: "#dicas", label: "Dicas da região" },
];

/** Template `HomePageTemplate` — esqueleto da home one-page. */
export function HomePageTemplate() {
  return (
    <div className="flex flex-col">
      <AnchorNav items={NAV_ITEMS} startHiddenForHero />
      <HeroSection />

      <StorySection />
      <EventSection />
      <DressCodeSection />
      <GiftSection />
      <StaySection />
      <TipsSection />

      <footer className="relative isolate overflow-hidden px-6 pb-[clamp(9rem,24vw,16rem)] pt-section-gap text-center">
        <Painting name="baia-veleiro" className="absolute bottom-0 left-1/2 w-[min(80vw,340px)] -translate-x-1/2" />
        <p className="font-display leading-snug text-text-primary" style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}>
          Esperamos vocês para celebrar com a gente!
        </p>
        <p className="mt-3 font-body text-100 uppercase tracking-[0.24em] text-text-secondary">
          Com amor, Gabriela &amp; Emanuel
        </p>
      </footer>
    </div>
  );
}
