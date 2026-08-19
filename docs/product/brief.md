# Brief do produto

Contexto: por que este produto existe e o que define sucesso, para orientar qualquer decisão de escopo futura.

## Problema

Casal precisa de um lugar único para centralizar informações do casamento e coletar confirmação de presença dos convidados, hoje espalhadas em conversas manuais (WhatsApp, telefone).

## Resultado esperado

- Convidados confirmam presença pelo próprio link pessoal, sem precisar perguntar "como faço".
- Casal visualiza, pelo Looker Studio, o percentual de confirmação e quem ainda não confirmou.
- Nenhuma pessoa fora da lista de convidados consegue confirmar presença.

## Escopo da v1

- Página one-page com: hero romântico, história do casal, informações do evento, recomendações de hospedagem/restaurantes, lista de presentes com Pix.
- Página pessoal por convidado (`/convite/<token>`): confirmação de presença, upload de foto, envio de mensagem/depoimento — utilizável antes e durante o evento.
- Envio de fotos e mensagens para o Google Drive do casal (pasta por convidado), de forma transparente ao convidado.
- Registro de confirmação em planilha Google Sheets, consumida pelo Looker Studio.

## Fora de escopo

Nada foi deixado fora — tudo entra na v1, dado o prazo de uma semana.
