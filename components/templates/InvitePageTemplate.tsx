import { RsvpFlow } from "@/components/organisms/RsvpFlow";
import type { GuestInvite } from "@/lib/google/sheets";
import type { GiftListData } from "@/lib/gifts";

export interface InvitePageTemplateProps {
  token: string;
  invite: GuestInvite;
  giftList: GiftListData;
}

/** Template `InvitePageTemplate` — esqueleto da página `/convite/[token]`. */
export function InvitePageTemplate({ token, invite, giftList }: InvitePageTemplateProps) {
  return (
    <main className="flex min-h-screen flex-col bg-page">
      <RsvpFlow
        token={token}
        initialNome={invite.nome || undefined}
        alreadyConfirmed={invite.status === "confirmado"}
        giftList={giftList}
      />
    </main>
  );
}
