import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RsvpFlow } from "@/components/organisms/RsvpFlow";

/**
 * Golden path do RSVP (token válido → preenche formulário → sucesso → mostra
 * presentes), ver docs/product/bootstrap-state.md (porte de teste Mínimo).
 * A chamada ao Google é mockada indiretamente: aqui simulamos a resposta da
 * própria rota `/api/rsvp` via fetch, sem depender de credencial real.
 */
describe("RsvpFlow — golden path do RSVP", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({ ok: true, nome: "Maria Silva" }),
      }),
    );
  });

  it("convidado com token válido preenche o formulário, confirma e vê a lista de presentes", async () => {
    const user = userEvent.setup();
    render(<RsvpFlow token="abc123XYZ" />);

    await user.type(screen.getByLabelText("Seu nome completo"), "Maria Silva");
    await user.type(screen.getByLabelText("Seu e-mail"), "maria@example.com");
    await user.type(screen.getByLabelText("Seu telefone (com DDD)"), "11912345678");

    await user.click(screen.getByRole("button", { name: /confirmar presença/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /presença confirmada, maria silva/i })).toBeInTheDocument();
    });

    expect(screen.getByRole("heading", { name: /lista de presentes/i })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "/api/rsvp",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          token: "abc123XYZ",
          nome: "Maria Silva",
          email: "maria@example.com",
          telefone: "11912345678",
        }),
      }),
    );
  });
});
