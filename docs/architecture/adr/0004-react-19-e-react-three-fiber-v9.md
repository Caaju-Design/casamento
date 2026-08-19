# ADR-0004: React 19 e @react-three/fiber v9 (em vez de React 18 e v8)

- Status: aceito
- Data: 2026-08-19
- Dono: Emanuel
- Impacto no Data Mapping: não

## Contexto

Durante a implementação, a cena three.js decorativa do hero (ver ADR-0001) quebrava em runtime no navegador com `TypeError: Cannot read properties of undefined (reading 'ReactCurrentOwner')`, reproduzido de forma isolada (uma página só com `<Canvas>` do `@react-three/fiber`, sem nenhum outro componente do projeto), tanto com Turbopack quanto com webpack, e tanto com React 18.3.1 quanto 18.2.0. Isso descartou hipóteses de bundler ou de patch version do React 18: é uma incompatibilidade real entre `@react-three/fiber` v8.x (que depende de `react-reconciler@^0.27.0`) e o Next.js 16.3.1 usado neste projeto (ver ADR-0002 sobre por que Next 16, não 14, foi escolhido).

## Decisão

Atualizar `react` e `react-dom` para `^19.0.0`, e `@react-three/fiber` para `^9.7.0` (que depende de `react-reconciler@^0.31.0`, compatível com React 19) — a combinação suportada oficialmente pelo mantenedor da biblioteca para este cenário. Isso também exigiu ajustar `Heading` e `Text` (`components/atoms/`): o padrão `const Tag = as as ElementType` passou a falhar o typecheck sob os tipos de React 19 (o `children` era inferido como `never`); a correção foi remover o cast para `ElementType` e deixar `Tag` com o tipo literal já restrito (`"h1"|"h2"|"h3"|"h4"` e `"p"|"span"`), que o JSX aceita diretamente.

## Alternativas consideradas

- Manter React 18 e trocar de bundler ou de versão do Next — descartada: o bug reproduziu igual em Turbopack e webpack, e o Next 16 foi escolhido especificamente para atender ao gate de vulnerabilidade do CI (ver ADR-0002/pendências); voltar pra uma versão anterior do Next reabriria esse problema.
- Manter `@react-three/fiber` v8 e tentar forçar uma versão mais nova de `react-reconciler` manualmente (override de dependência) — descartada: não é uma combinação testada/suportada pelo mantenedor, risco alto para um efeito puramente decorativo.

## Consequências

- Fica mais fácil manter a cena three.js no futuro, usando a versão da biblioteca de fato mantida para o React atual.
- Fica mais difícil usar bibliotecas de terceiros que ainda não suportam React 19, caso alguma seja adicionada depois — risco baixo dado o escopo fechado do projeto.
- Exigiu revalidar toda a suíte de testes (Testing Library já suporta React 19) e o typecheck após o upgrade — feito, tudo verde (lint, typecheck, build, 35 testes).
