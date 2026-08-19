# ADR-0007: Volta para Drive compartilhado, revogando a delegação de domínio

- Status: aceito (substitui ADR-0006, restaura o mecanismo do ADR-0005)
- Data: 2026-08-19
- Dono: Emanuel
- Impacto no Data Mapping: sim

## Contexto

Ao revisar o ADR-0006, o casal levantou uma preocupação de segurança válida: os escopos usados na delegação de domínio (`drive` e `documents`) não são restritos a uma pasta — eles dão à conta de serviço a capacidade de agir como `emanuel@caaju.com.br` em **todo** o Drive/Docs pessoal dele, não só na pasta do casamento. Se a chave privada da conta de serviço fosse exposta, o estrago possível seria muito maior do que pretendido. O Drive compartilhado (ADR-0005) não tem esse problema: o acesso da conta de serviço fica limitado ao que está dentro daquele Drive compartilhado especificamente.

## Decisão

Criado um Drive compartilhado ("Casamento") com a conta de serviço `casamento-rsvp@casamento-caaju.iam.gserviceaccount.com` como membro (papel "Gerente de conteúdo"/`fileOrganizer`). A API do Google **não permite mover uma pasta já existente para dentro de um Drive compartilhado** (`teamDrivesFolderMoveInNotSupported`), então, em vez de mover a pasta "Convidados" original, foi criada uma pasta "Convidados" nova diretamente dentro do Drive compartilhado — a original ficou vazia (nenhum dado real chegou a ser gravado nela) e pode ser ignorada/removida pelo casal. `GOOGLE_DRIVE_ROOT_FOLDER_ID` passou a apontar para essa nova pasta. O código voltou a autenticar como a própria conta de serviço, sem `subject`/impersonação — `GOOGLE_IMPERSONATED_USER_EMAIL` foi removido do `.env.local` e da Vercel. A delegação de domínio autorizada em `admin.google.com` foi revogada pelo casal depois de confirmado que o código não depende mais dela. Testado de ponta a ponta com registro descartável: pasta, foto e documento de mensagem criados com sucesso dentro do Drive compartilhado.

## Alternativas consideradas

- Manter a delegação de domínio (ADR-0006) — descartada pelo risco de escopo: um vazamento da chave privada da conta de serviço daria acesso a todo o Drive/Docs pessoal do Emanuel, não só à pasta do casamento.
- Mover a pasta "Convidados" original para dentro do Drive compartilhado — tentado e descartado: a API do Google não suporta essa operação para pastas já existentes.

## Consequências

- Fica mais seguro: mesmo que a chave da conta de serviço seja exposta, o acesso possível fica restrito ao conteúdo do Drive compartilhado "Casamento", nunca ao resto do Drive pessoal do casal.
- Fica um pouco mais manual: a pasta "Convidados" é uma pasta nova (dentro do Drive compartilhado), não a que o casal preparou originalmente — sem perda de dado real, já que nenhum convidado tinha enviado foto/mensagem ainda.
- A pasta "CONVIDADOS" original (fora do Drive compartilhado) ficou órfã — não é mais referenciada pelo site; o casal pode arquivá-la ou apagá-la quando quiser.
