"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import { Input } from "@/components/atoms/Input";
import { Text } from "@/components/atoms/Text";
import { FormField } from "@/components/molecules/FormField";
import { type FieldErrors, validateRsvpInput } from "@/lib/validation";

export interface RsvpFormProps {
  token: string;
  initialNome?: string;
  onConfirmed: (nome: string) => void;
}

interface BannerMessage {
  tone: "error" | "info";
  text: string;
}

/**
 * Organism `RsvpForm` — página `/convite/[token]`.
 *
 * Cobre os estados de docs/design-system/matriz-estados.md relevantes ao
 * envio do RSVP: carregando, erro de validação, backend indisponível,
 * timeout, offline e limite de taxa excedido. O convite inválido/não
 * encontrado é tratado antes deste componente (ver app/convite/[token]/page.tsx).
 */
export function RsvpForm({ token, initialNome, onConfirmed }: RsvpFormProps) {
  const [nome, setNome] = useState(initialNome ?? "");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<BannerMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsOffline(!navigator.onLine);
    }
    function handleOnline() {
      setIsOffline(false);
    }
    function handleOffline() {
      setIsOffline(true);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBanner(null);

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsOffline(true);
      setBanner({
        tone: "error",
        text: "Você está sem conexão agora. Assim que a internet voltar, confirme de novo — não guardamos sua confirmação enquanto estiver offline.",
      });
      return;
    }

    const input = { nome, email, telefone };
    const errors = validateRsvpInput(input);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...input }),
      });

      const data = (await response.json().catch(() => null)) as
        | { ok: true; nome?: string }
        | { ok: false; error: { code: string; message: string; fieldErrors?: FieldErrors } }
        | null;

      if (!data) {
        setBanner({ tone: "error", text: "Algo inesperado aconteceu. Tenta confirmar de novo em instantes." });
        return;
      }

      if (!data.ok) {
        if (data.error.fieldErrors) {
          setFieldErrors(data.error.fieldErrors);
        }
        setBanner({ tone: "error", text: data.error.message });
        return;
      }

      onConfirmed(data.nome || nome);
    } catch {
      setBanner({
        tone: "error",
        text: "Não conseguimos falar com o servidor agora — pode ser sua conexão. Confira a internet e tente de novo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-6" noValidate>
      {isOffline ? (
        <div className="flex items-center gap-2 rounded-control border border-feedback-error bg-blush-50 p-4">
          <Icon name="error" size={18} className="text-feedback-error" />
          <Text tone="error" className="text-100">
            Você está sem conexão. Você ainda pode preencher, mas só conseguimos confirmar quando a internet
            voltar.
          </Text>
        </div>
      ) : null}

      {banner ? (
        <div
          role="alert"
          className={[
            "flex items-center gap-2 rounded-control p-4",
            banner.tone === "error" ? "border border-feedback-error bg-blush-50" : "border border-border-subtle bg-surface",
          ].join(" ")}
        >
          <Icon name="error" size={18} className={banner.tone === "error" ? "text-feedback-error" : "text-text-secondary"} />
          <Text tone={banner.tone === "error" ? "error" : "secondary"} className="text-100">
            {banner.text}
          </Text>
        </div>
      ) : null}

      <FormField id="nome" label="Seu nome completo" error={fieldErrors.nome}>
        <Input
          id="nome"
          name="nome"
          autoComplete="name"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          hasError={Boolean(fieldErrors.nome)}
          disabled={isSubmitting}
        />
      </FormField>

      <FormField id="email" label="Seu e-mail" error={fieldErrors.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          hasError={Boolean(fieldErrors.email)}
          disabled={isSubmitting}
        />
      </FormField>

      <FormField id="telefone" label="Seu telefone (com DDD)" error={fieldErrors.telefone}>
        <Input
          id="telefone"
          name="telefone"
          type="tel"
          autoComplete="tel"
          value={telefone}
          onChange={(event) => setTelefone(event.target.value)}
          hasError={Boolean(fieldErrors.telefone)}
          disabled={isSubmitting}
        />
      </FormField>

      <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
        {isSubmitting ? "Confirmando presença…" : "Confirmar presença"}
      </Button>
    </form>
  );
}
