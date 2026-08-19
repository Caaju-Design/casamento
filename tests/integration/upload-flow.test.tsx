import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestimonialSection } from "@/components/organisms/TestimonialSection";

const JPEG_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);

/**
 * Golden path do upload de foto (token válido → sobe imagem válida →
 * sucesso), ver docs/product/bootstrap-state.md (porte de teste Mínimo).
 * O envio real ao Google Drive é mockado via fetch para `/api/upload`.
 */
describe("TestimonialSection — golden path do upload de foto", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({ ok: true }),
      }),
    );
    if (typeof URL.createObjectURL !== "function") {
      // jsdom não implementa createObjectURL — só usado para pré-visualização.
      URL.createObjectURL = () => "blob:mock";
    }
  });

  it("convidado com token válido escolhe uma foto e envia com sucesso", async () => {
    const user = userEvent.setup();
    const { container } = render(<TestimonialSection token="abc123XYZ" />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([JPEG_BYTES], "foto.jpg", { type: "image/jpeg" });
    await user.upload(fileInput, file);

    await user.click(screen.getByRole("button", { name: /enviar para o casal/i }));

    await waitFor(() => {
      expect(screen.getByText(/recebemos com carinho/i)).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/upload",
      expect.objectContaining({ method: "POST" }),
    );
    const callArgs = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    if (!callArgs) throw new Error("fetch não foi chamado");
    const sentFormData = callArgs[1].body as FormData;
    expect(sentFormData.get("token")).toBe("abc123XYZ");
    expect(sentFormData.get("foto")).toBeInstanceOf(File);
  });
});
