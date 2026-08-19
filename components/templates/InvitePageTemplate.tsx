import { RsvpFlow } from "@/components/organisms/RsvpFlow";
import type { GuestInvite } from "@/lib/google/sheets";

export interface InvitePageTemplateProps {
  token: string;
  invite: GuestInvite;
}

/** Template `InvitePageTemplate` — esqueleto da página `/convite/[token]`. */
export function InvitePageTemplate({ token, invite }: InvitePageTemplateProps) {
  return (
    <main className="flex min-h-screen flex-col bg-page">
      <RsvpFlow
        token={token}
        initialNome={invite.nome || undefined}
        alreadyConfirmed={invite.status === "confirmado"}
      />
    </main>
  );
}
