import type { ReactNode } from "react";
import { Text } from "@/components/atoms/Text";

export interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

/** Molecule `FormField` (label + input + mensagem de erro) — formulário de RSVP. */
export function FormField({ id, label, error, hint, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-field-gap">
      <label htmlFor={id} className="font-body text-100 font-medium text-text-secondary">
        {label}
      </label>
      {children}
      {error ? (
        <Text as="span" tone="error" role="alert" className="text-100">
          {error}
        </Text>
      ) : hint ? (
        <Text as="span" tone="secondary" className="text-100">
          {hint}
        </Text>
      ) : null}
    </div>
  );
}
