# ADR-0005: Upload de foto/mensagem exige Drive compartilhado (Shared Drive)

- Status: aceito
- Data: 2026-08-19
- Dono: Emanuel
- Impacto no Data Mapping: sim

## Contexto

No teste de ponta a ponta contra a planilha e a pasta reais (RSVP funcionando, upload falhando), o upload de foto retornou erro da API do Google: "Service Accounts do not have storage quota." Contas de serviço do Google não têm cota de armazenamento própria — não conseguem criar arquivo novo dentro de uma pasta comum ("Minhas unidades") de uma conta pessoal, mesmo com permissão de Editor. Isso só funciona dentro de um **Drive compartilhado** (recurso do Google Workspace) ou com **delegação de domínio** (exige acesso de administrador do Workspace). O casal confirmou que `caaju.com.br` é uma conta Google Workspace, então Drive compartilhado é o caminho disponível sem precisar de acesso de administrador.

## Decisão

A pasta "Convidados" (e a subpasta de cada convidado, criada automaticamente — ver ADR-0002) passa a viver dentro de um Drive compartilhado do Workspace do casal, com a conta de serviço `casamento-rsvp@casamento-caaju.iam.gserviceaccount.com` adicionada como membro ("Gerente de conteúdo"). O código em `lib/google/drive.ts` passou a enviar `supportsAllDrives: true` (e `includeItemsFromAllDrives: true` na busca) em toda chamada à API do Drive — sem esses parâmetros, a API ignora silenciosamente itens de Drive compartilhado, como se não existissem.

## Alternativas consideradas

- Delegação de domínio (a conta de serviço age em nome do próprio Emanuel) — descartada por exigir acesso de administrador do Google Workspace para autorizar no painel admin, mais complexo que criar um Drive compartilhado, que qualquer membro do Workspace normalmente pode fazer.
- Guardar a foto em outro serviço (ex.: bucket de armazenamento de nuvem) em vez do Drive — descartada: o casal já usa o Drive como ferramenta de curadoria das fotos (ADR-0002), trocar de serviço destruiria essa vantagem sem necessidade.

## Consequências

- Fica mais fácil a conta de serviço operar sem exigir privilégio de administrador do Workspace.
- Fica mais difícil (um passo manual extra) preparar o ambiente: o casal precisa criar o Drive compartilhado e adicionar a conta de serviço como membro antes do upload funcionar — documentado em `docs/product/pendencias.md`.
- A planilha de RSVP (Google Sheets) não tem essa limitação — a API do Sheets não exige Drive compartilhado para leitura/escrita de valores, só a API do Drive (arquivo/pasta) é afetada.
