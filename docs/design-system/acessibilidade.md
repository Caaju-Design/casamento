# Acessibilidade — registro do projeto

Este arquivo registra decisões específicas deste projeto, não os critérios gerais de WCAG (que vivem na skill de bootstrap, não são copiados aqui).

## Exceção aceita

O produto é de acesso público, o que tornaria a Lei Brasileira de Inclusão (13.146) uma exigência mesmo contra preferência da pessoa. O casal foi avisado disso explicitamente durante o bootstrap (2026-08-19) e optou por **não aplicar** os critérios de acessibilidade (WCAG 2.2) nesta v1, incluindo:

- Contraste mínimo AA.
- Texto alternativo em imagens informativas.
- Navegação completa por teclado.
- `prefers-reduced-motion` no efeito three.js decorativo (ver `docs/architecture/adr/`).

Decisão do casal, registrada também em `docs/product/bootstrap-state.md`. Data de revisão: sem prazo definido — pode ser revisitada se o casal mudar de ideia antes do lançamento.

## O que permanece, independente da exceção

- Linguagem clara em qualquer mensagem de erro/estado (ver `docs/design-system/matriz-estados.md` e `docs/product/brand/tom-de-voz.md`) — não é tratado como item de acessibilidade dispensável, é requisito de produto.
- Fallback obrigatório do three.js para dispositivo/navegador sem suporte a WebGL — não é acessibilidade, é robustez básica (nunca tela em branco ou quebrada).
- Orçamento de performance do three.js para funcionar em celular mais fraco — pedido explícito do casal, independente da exceção de acessibilidade.
