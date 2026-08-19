# Pendências

Riscos e decisões em aberto que surgiram durante o bootstrap — cada item tem próximo passo e dono, para permitir acompanhamento. Itens sem próximo passo definido não entram aqui.

## Validações

Nenhuma no momento — o casal decidiu não buscar validação jurídica formal da base legal de tratamento (todos os titulares são familiares); mantém-se "consentimento" como base legal em `docs/security/data-mapping.md`, decisão do casal, não do agente.

## Dependências externas

| Item | Contexto | Impacto | Dono | Próximo passo | Data de revisão |
| --- | --- | --- | --- | --- | --- |
| Confirmar se o link de lista de convidados enviado (`.../folders/1EOfDdEEjN-x5xiNJuKr99kxetJejsKFz`) já tem token por convidado, ou é só a lista de nomes | O RSVP depende de token pessoal por convidado (ver ADR-0003); uma lista sem token precisa passar por uma etapa de geração antes de virar link de convite | Bloqueia o envio de convites e o teste do fluxo de RSVP | Emanuel/Casal | Confirmar formato do conteúdo desse link | 2026-08-20 |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` precisa apontar para a subpasta "Convidados", não para a pasta raiz | O código já cria a subpasta de cada convidado automaticamente (não precisa preparar manualmente) dentro do ID configurado nessa variável — mas a pasta raiz que o casal compartilhou também contém a planilha, então a variável deve apontar para "Convidados" especificamente | Se apontar para a pasta errada, as subpastas de convidado nascem misturadas com a planilha | Casal | Enviar o ID da subpasta "Convidados" | 2026-08-22 |
| Conteúdo da lista de presentes + imagens de QR code Pix | Tela de sucesso do RSVP exibe presentes e Pix | Bloqueia a seção de presentes | Casal | Enviar lista e imagens | 2026-08-22 |
| Conta de serviço do Google (Sheets + Drive API) | Backend precisa de credencial de serviço para gravar na planilha e no Drive | Bloqueia toda a integração | Emanuel (com ajuda do agente) | Criar projeto/conta de serviço no Google Cloud, habilitar Sheets+Drive API, compartilhar acesso com a planilha/pastas | 2026-08-20 |

## Trabalho local

| Item | Contexto | Impacto | Dono | Próximo passo | Data de revisão |
| --- | --- | --- | --- | --- | --- |
| Deploy inicial na Vercel | Código só existe local + no GitHub; nunca foi implantado | Site não está acessível publicamente ainda | Emanuel | Criar/linkar projeto na Vercel e fazer o primeiro deploy | 2026-08-20 |
| Configurar domínio `casamento.caaju.com.br` na Vercel | Domínio já existe, precisa apontar para o projeto | Bloqueia acesso público pelo domínio final | Emanuel | Configurar DNS e domínio custom na Vercel | 2026-08-22 |
