# Pendências

Riscos e decisões em aberto que surgiram durante o bootstrap — cada item tem próximo passo e dono, para permitir acompanhamento. Itens sem próximo passo definido não entram aqui.

## Validações

Nenhuma no momento — o casal decidiu não buscar validação jurídica formal da base legal de tratamento (todos os titulares são familiares); mantém-se "consentimento" como base legal em `docs/security/data-mapping.md`, decisão do casal, não do agente.

## Dependências externas

| Item | Contexto | Impacto | Dono | Próximo passo | Data de revisão |
| --- | --- | --- | --- | --- | --- |
| Criar Drive compartilhado e mover/recriar "Convidados" lá dentro (ver ADR-0005) | Upload real testado e falhou: conta de serviço não tem cota própria em pasta comum do Drive — só funciona em Drive compartilhado (Workspace) | Bloqueia o upload de foto/mensagem em produção | Casal | Criar o Drive compartilhado, adicionar `casamento-rsvp@casamento-caaju.iam.gserviceaccount.com` como Gerente de conteúdo, mover a pasta "Convidados" pra lá e mandar o novo ID | 2026-08-20 |
| Conteúdo da lista de presentes + imagens de QR code Pix | Tela de sucesso do RSVP exibe presentes e Pix | Bloqueia a seção de presentes | Casal | Enviar lista e imagens | 2026-08-22 |

## Trabalho local

| Item | Contexto | Impacto | Dono | Próximo passo | Data de revisão |
| --- | --- | --- | --- | --- | --- |
| Deploy inicial na Vercel | Código só existe local + no GitHub; nunca foi implantado | Site não está acessível publicamente ainda | Emanuel | Criar/linkar projeto na Vercel e fazer o primeiro deploy | 2026-08-20 |
| Configurar domínio `casamento.caaju.com.br` na Vercel | Domínio já existe, precisa apontar para o projeto | Bloqueia acesso público pelo domínio final | Emanuel | Configurar DNS e domínio custom na Vercel | 2026-08-22 |
