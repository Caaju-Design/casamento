# Pendências

Riscos e decisões em aberto que surgiram durante o bootstrap — cada item tem próximo passo e dono, para permitir acompanhamento. Itens sem próximo passo definido não entram aqui.

## Validações

Nenhuma no momento — o casal decidiu não buscar validação jurídica formal da base legal de tratamento (todos os titulares são familiares); mantém-se "consentimento" como base legal em `docs/security/data-mapping.md`, decisão do casal, não do agente.

## Dependências externas

| Item | Contexto | Impacto | Dono | Próximo passo | Data de revisão |
| --- | --- | --- | --- | --- | --- |
| Criar Drive compartilhado e mover/recriar "Convidados" lá dentro (ver ADR-0005) | Upload real testado e falhou: conta de serviço não tem cota própria em pasta comum do Drive — só funciona em Drive compartilhado (Workspace) | Bloqueia o upload de foto/mensagem em produção | Casal | Criar o Drive compartilhado, adicionar `casamento-rsvp@casamento-caaju.iam.gserviceaccount.com` como Gerente de conteúdo, mover a pasta "Convidados" pra lá e mandar o novo ID | 2026-08-20 |
| Preencher os itens da lista de presentes | Aba "Presentes" já existe na planilha (coluna A: nome do presente), mas ainda sem linhas — enquanto vazia, o site mostra "Estamos preparando a lista" | Seção de presentes fica sem itens até ser preenchida | Gabriela | Adicionar os presentes na aba "Presentes" (coluna A; coluna B opcional para descrição) | — |

## Trabalho local

Nenhum no momento — site em produção em `casamento.caaju.com.br` desde 2026-08-19.
