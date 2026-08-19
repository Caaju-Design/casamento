"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/atoms/Button";
import { Heading } from "@/components/atoms/Heading";
import { Icon } from "@/components/atoms/Icon";
import { Text } from "@/components/atoms/Text";
import { TextArea } from "@/components/atoms/TextArea";
import { FormField } from "@/components/molecules/FormField";
import { PhotoDropzone } from "@/components/molecules/PhotoDropzone";

export interface TestimonialSectionProps {
  token: string;
}

type SubmitState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success" }
  | { kind: "cancelled" }
  | { kind: "error"; message: string };

/**
 * Organism `TestimonialSection` — coleta de depoimento (e foto) no convite
 * pessoal, depois da confirmação de presença. Cobre carregando, erro de
 * validação, backend indisponível, timeout, offline e cancelamento do
 * envio (ver docs/design-system/matriz-estados.md).
 */
export function TestimonialSection({ token }: TestimonialSectionProps) {
  const [foto, setFoto] = useState<File | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [fotoError, setFotoError] = useState<string | undefined>();
  const [mensagemError, setMensagemError] = useState<string | undefined>();
  const [state, setState] = useState<SubmitState>({ kind: "idle" });
  const abortControllerRef = useRef<AbortController | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFotoError(undefined);
    setMensagemError(undefined);

    if (!foto && !mensagem.trim()) {
      setMensagemError("Escreva uma mensagem ou escolha uma foto antes de enviar.");
      return;
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setState({
        kind: "error",
        message: "Você está sem conexão agora. Assim que a internet voltar, tente enviar de novo.",
      });
      return;
    }

    const formData = new FormData();
    formData.set("token", token);
    if (foto) formData.set("foto", foto);
    if (mensagem.trim()) formData.set("mensagem", mensagem.trim());

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setState({ kind: "loading" });

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      const data = (await response.json().catch(() => null)) as
        | { ok: true }
        | { ok: false; error: { code: string; message: string } }
        | null;

      if (!data) {
        setState({ kind: "error", message: "Algo inesperado aconteceu. Tente enviar de novo em instantes." });
        return;
      }
      if (!data.ok) {
        setState({ kind: "error", message: data.error.message });
        return;
      }
      setFoto(null);
      setMensagem("");
      setState({ kind: "success" });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setState({ kind: "cancelled" });
        return;
      }
      setState({
        kind: "error",
        message: "Não conseguimos falar com o servidor agora — pode ser sua conexão. Confira a internet e tente de novo.",
      });
    } finally {
      abortControllerRef.current = null;
    }
  }

  function handleCancel() {
    abortControllerRef.current?.abort();
  }

  const isLoading = state.kind === "loading";

  return (
    <section id="depoimento" className="mx-auto max-w-md px-6 py-section-gap">
      <Heading className="text-center">Deixe seu carinho para o casal</Heading>
      <Text tone="secondary" className="mx-auto mt-2 max-w-sm text-center">
        Uma foto do momento, uma mensagem, ou os dois — o que vier do coração já é lembrança guardada.
      </Text>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <PhotoDropzone value={foto} onChange={setFoto} error={fotoError} disabled={isLoading} />

        <FormField id="mensagem" label="Sua mensagem" error={mensagemError}>
          <TextArea
            id="mensagem"
            name="mensagem"
            rows={4}
            value={mensagem}
            onChange={(event) => setMensagem(event.target.value)}
            hasError={Boolean(mensagemError)}
            disabled={isLoading}
            placeholder="Escreva um recadinho para o casal…"
          />
        </FormField>

        {state.kind === "error" ? (
          <div role="alert" className="flex items-center gap-2 rounded-control border border-feedback-error bg-blush-50 p-4">
            <Icon name="error" size={18} className="text-feedback-error" />
            <Text tone="error" className="text-100">
              {state.message}
            </Text>
          </div>
        ) : null}

        {state.kind === "cancelled" ? (
          <Text tone="secondary" className="text-100">
            Envio cancelado. Quando quiser, é só tentar de novo.
          </Text>
        ) : null}

        {state.kind === "success" ? (
          <div className="flex items-center gap-2 rounded-control border border-border-subtle bg-surface p-4">
            <Icon name="check" size={18} className="text-feedback-success" />
            <Text tone="success" className="text-100">
              Recebemos com carinho! Muito obrigado por compartilhar esse momento com a gente.
            </Text>
          </div>
        ) : null}

        <div className="flex gap-field-gap">
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            {isLoading ? "Enviando…" : "Enviar para o casal"}
          </Button>
          {isLoading ? (
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Cancelar envio
            </Button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
