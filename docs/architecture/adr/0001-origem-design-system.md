# ADR-0001: Design system criado do zero, estilo Bridgerton

- Status: aceito
- Data: 2026-08-19
- Dono: Emanuel
- Impacto no Data Mapping: não

## Contexto

O site precisa de um visual romântico e próprio, sem tema claro/escuro (só um visual), e o casal não tem nenhuma biblioteca de componentes em uso hoje. O produto será descartado após o casamento, então o investimento em design system deve ser proporcional a esse ciclo de vida curto.

## Decisão

Design system criado do zero (fundação, atoms, molecules, organisms), com tokens no formato DTCG em três camadas (primitivo, semântico, componente), aplicado via Tailwind CSS. Paleta e tipografia inspiradas em estética Regência/Bridgerton (tons pastéis, dourado, serifada romântica).

## Alternativas consideradas

- Biblioteca de componentes de terceiros (ex.: shadcn/ui) — descartada porque o casal não tinha preferência e o visual customizado (Bridgerton) exigiria sobrescrever a maior parte dos componentes de qualquer forma.
- Sem design system formal, CSS ad-hoc por seção — descartada porque a página tem muitas seções reaproveitando os mesmos padrões visuais (cartão, botão, formulário), e a falta de tokens geraria inconsistência mesmo em um projeto curto.

## Consequências

- Fica mais fácil manter consistência visual entre as seções do one-page.
- Fica mais fácil trocar cor/tipografia globalmente via tokens, caso o casal peça ajuste de última hora.
- Exige inventariar componente antes de criar um novo, mesmo sob pressão de prazo.
