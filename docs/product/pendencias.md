# Pendências

Riscos e decisões em aberto que surgiram durante o bootstrap — cada item tem próximo passo e dono, para permitir acompanhamento. Itens sem próximo passo definido não entram aqui.

## Decisões necessárias

| Item | Contexto | Impacto | Dono | Próximo passo | Data de revisão |
| --- | --- | --- | --- | --- | --- |
| Confirmar necessidade da página de status público | Pedido no cardápio de artefatos, mas atípico para um site de casamento (normalmente serve produto com uptime crítico) | Se descartada, remove um artefato do escopo | Casal | Confirmar se mantém ou remove | 2026-08-26 |

## Validações

| Item | Contexto | Impacto | Dono | Próximo passo | Data de revisão |
| --- | --- | --- | --- | --- | --- |
| Validação jurídica da base legal de tratamento | Base legal registrada como "consentimento" em `data-mapping.md`, sem revisão jurídica formal | Risco de LGPD se a base legal estiver mal enquadrada | Casal/jurídico se necessário | Revisar se há dúvida sobre a base legal antes do lançamento | 2026-08-26 |

## Dependências externas

| Item | Contexto | Impacto | Dono | Próximo passo | Data de revisão |
| --- | --- | --- | --- | --- | --- |
| Lista final de convidados e geração dos links únicos | Cada convidado precisa de um token pessoal antes do envio dos convites | Bloqueia o envio de convites e o teste do fluxo de RSVP | Casal | Fechar lista e gerar tokens | 2026-08-22 |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` precisa apontar para a subpasta "Convidados", não para a pasta raiz | O código já cria a subpasta de cada convidado automaticamente (não precisa preparar manualmente) dentro do ID configurado nessa variável — mas a pasta raiz que o casal compartilhou também contém a planilha, então a variável deve apontar para "Convidados" especificamente | Se apontar para a pasta errada, as subpastas de convidado nascem misturadas com a planilha | Casal | Enviar o ID da subpasta "Convidados" | 2026-08-22 |
| Conteúdo da lista de presentes + imagens de QR code Pix | Tela de sucesso do RSVP exibe presentes e Pix | Bloqueia a seção de presentes | Casal | Enviar lista e imagens | 2026-08-22 |
| Conta de serviço do Google (Sheets + Drive API) | Backend precisa de credencial de serviço para gravar na planilha e no Drive | Bloqueia toda a integração | Emanuel | Criar conta de serviço no Google Cloud e compartilhar acesso com a planilha/pastas | 2026-08-22 |

## Trabalho local

| Item | Contexto | Impacto | Dono | Próximo passo | Data de revisão |
| --- | --- | --- | --- | --- | --- |
| Configurar domínio `casamento.caaju.com.br` na Vercel | Domínio já existe, precisa apontar para o projeto | Bloqueia acesso público pelo domínio final | Emanuel | Configurar DNS e domínio custom na Vercel | 2026-08-22 |
