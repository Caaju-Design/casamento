import { Heading } from "@/components/atoms/Heading";
import { Icon } from "@/components/atoms/Icon";
import { Text } from "@/components/atoms/Text";

/**
 * Estado "Token inválido/não encontrado" (ver docs/design-system/matriz-estados.md):
 * nunca expõe detalhe técnico do token, sempre orienta a falar com o casal.
 */
export function InviteNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <Icon name="error" size={32} className="text-feedback-error" />
      <Heading>Não encontramos seu convite</Heading>
      <Text tone="secondary" className="max-w-md">
        Esse link pode estar incompleto ou já não corresponder a um convite ativo. Confira se copiou o
        endereço certinho ou fale diretamente com o casal para receber o link correto.
      </Text>
    </div>
  );
}
