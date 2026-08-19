# Pendências

Riscos e decisões em aberto que surgiram durante o bootstrap — cada item tem próximo passo e dono, para permitir acompanhamento. Itens sem próximo passo definido não entram aqui.

## Validações

Nenhuma no momento — o casal decidiu não buscar validação jurídica formal da base legal de tratamento (todos os titulares são familiares); mantém-se "consentimento" como base legal em `docs/security/data-mapping.md`, decisão do casal, não do agente.

## Dependências externas

| Item | Contexto | Impacto | Dono | Próximo passo | Data de revisão |
| --- | --- | --- | --- | --- | --- |
| Preencher os itens da lista de presentes | Aba "Presentes" já existe na planilha (coluna A: nome do presente), mas ainda sem linhas — enquanto vazia, o site mostra "Estamos preparando a lista" | Seção de presentes fica sem itens até ser preenchida | Gabriela | Adicionar os presentes na aba "Presentes" (coluna A; coluna B opcional para descrição) | — |

## Trabalho local

| Item | Contexto | Impacto | Dono | Próximo passo | Data de revisão |
| --- | --- | --- | --- | --- | --- |
| Confirmar revogação da delegação de domínio | ADR-0007 substituiu a abordagem por Drive compartilhado; o código não depende mais disso | Baixo — só limpeza de segurança | Emanuel | Remover a entrada em `admin.google.com/ac/owl/domainwidedelegation` (ID de cliente `115587939002442569613`), se ainda não tiver feito | — |
| Pasta "CONVIDADOS" original ficou órfã (fora do Drive compartilhado) | Não é mais referenciada pelo site desde o ADR-0007 | Nenhum — só organização | Casal | Arquivar ou apagar quando quiser | — |
