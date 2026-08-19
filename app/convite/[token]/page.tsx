import type { Metadata } from "next";
import { InviteNotFound } from "@/components/organisms/InviteNotFound";
import { InvitePageTemplate } from "@/components/templates/InvitePageTemplate";
import { resolveInvite } from "@/lib/invite/token";

export const metadata: Metadata = {
  title: "Seu convite — Nome & Nome",
};

// Sempre resolve o convite no servidor a cada requisição — nunca em cache
// estático — já que a validação de acesso depende do token (ver
// docs/architecture/adr/0003-acesso-sem-login-e-link-unico-por-convidado.md).
export const dynamic = "force-dynamic";

interface InvitePageProps {
  params: { token: string };
}

export default async function InvitePage({ params }: InvitePageProps) {
  const lookup = await resolveInvite(params.token);

  if (lookup.status !== "found") {
    return <InviteNotFound />;
  }

  return <InvitePageTemplate token={lookup.invite.token} invite={lookup.invite} />;
}
