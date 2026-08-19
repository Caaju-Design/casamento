# ADR-0006: Delegação de domínio em vez de Drive compartilhado

- Status: substituído por ADR-0007
- Data: 2026-08-19
- Dono: Emanuel
- Impacto no Data Mapping: sim

## Contexto

O ADR-0005 propôs resolver a falta de cota de armazenamento da conta de serviço criando um Drive compartilhado e movendo a pasta "Convidados" pra lá. Ao discutir a implementação, o casal preferiu não mover a estrutura já existente e perguntou se dava para manter a pasta original — Emanuel confirmou ter acesso de administrador do Google Workspace (`admin.google.com`) para `caaju.com.br`, o que libera a alternativa de delegação de domínio, descartada no ADR-0005 justamente por exigir esse acesso.

## Decisão

A conta de serviço `casamento-rsvp@casamento-caaju.iam.gserviceaccount.com` passa a agir por **delegação de domínio** (domain-wide delegation), impersonando `emanuel@caaju.com.br` (variável `GOOGLE_IMPERSONATED_USER_EMAIL`) em toda chamada às APIs do Drive e do Docs. O admin do Workspace autorizou o ID do cliente da conta de serviço com os escopos `drive` e `documents` em `admin.google.com/ac/owl/domainwidedelegation`. Os arquivos criados passam a contar contra a cota pessoal do Emanuel, então a pasta "Convidados" original (`GOOGLE_DRIVE_ROOT_FOLDER_ID`) continua sendo usada sem precisar mover nada. Testado de ponta a ponta com registro descartável: pasta de convidado, foto e documento de mensagem criados com sucesso, depois removidos.

## Alternativas consideradas

- Drive compartilhado (ADR-0005) — descartado porque exigiria mover/recriar a estrutura já existente, e o casal preferiu manter a pasta original.

## Consequências

- Fica mais simples: nenhuma pasta precisa ser movida, a estrutura que o casal já preparou continua valendo.
- Fica mais difícil revogar o acesso de forma granular: delegação de domínio dá à conta de serviço a capacidade de agir como `emanuel@caaju.com.br` em qualquer arquivo do Drive/Docs dele com os escopos autorizados, não só na pasta "Convidados" — mitigado por serem só 2 escopos (Drive e Docs) e por ser revogável a qualquer momento em `admin.google.com`.
- Arquivos de foto/mensagem passam a contar contra o armazenamento pessoal do Emanuel, não contra um espaço neutro do "time" — sem impacto prático dado o volume esperado (fotos de convidados de um casamento).
