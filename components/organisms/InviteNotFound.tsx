import { Heading } from "@/components/atoms/Heading";
import { Icon } from "@/components/atoms/Icon";
import { Text } from "@/components/atoms/Text";

export interface InviteNotFoundProps {
  /** "not_found" (link inválido) vs "unavailable" (backend indisponível — ver docs/architecture/risks.md). */
  reason?: "not_found" | "unavailable";
}

/**
 * Estados "Token inválido/não encontrado" e "Backend indisponível" (ver
 * docs/design-system/matriz-estados.md): nunca expõe detalhe técnico do
 * token, e distingue link inválido de falha temporária nossa — um convidado
 * legítimo não deve achar que o convite dele não existe só porque a
 * planilha do Google está fora do ar.
 */
export function InviteNotFound({ reason = "not_found" }: InviteNotFoundProps) {
  const isUnavailable = reason === "unavailable";
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <Icon name="error" size={32} className="text-feedback-error" />
      <Heading>{isUnavailable ? "Não conseguimos abrir seu convite agora" : "Não encontramos seu convite"}</Heading>
      <Text tone="secondary" className="max-w-md">
        {isUnavailable
          ? "Estamos com uma instabilidade temporária. Tente atualizar a página em alguns minutos — seu link continua válido."
          : "Esse link pode estar incompleto ou já não corresponder a um convite ativo. Confira se copiou o endereço certinho ou fale diretamente com o casal para receber o link correto."}
      </Text>
    </div>
  );
}
