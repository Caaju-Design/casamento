import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";

export interface GiftCardProps {
  title: string;
  description: string;
}

/** Molecule `GiftCard` — ideia de presente exibida na lista após o RSVP (sem Pix próprio, ver `PixBlock`). */
export function GiftCard({ title, description }: GiftCardProps) {
  return (
    <div className="flex flex-col gap-field-gap rounded-card bg-accent p-card-padding shadow-sm">
      <Heading as="h3" size="sm">
        {title}
      </Heading>
      {description ? <Text tone="secondary">{description}</Text> : null}
    </div>
  );
}
