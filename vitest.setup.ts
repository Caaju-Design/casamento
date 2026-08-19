import "@testing-library/jest-dom/vitest";

// jsdom não implementa URL.createObjectURL/revokeObjectURL — usados só para
// pré-visualização de imagem no PhotoDropzone (ver components/molecules/PhotoDropzone.tsx).
if (typeof URL.createObjectURL !== "function") {
  URL.createObjectURL = () => "blob:mock";
}
if (typeof URL.revokeObjectURL !== "function") {
  URL.revokeObjectURL = () => {};
}
