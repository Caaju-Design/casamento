# ADR-0002: Google Sheets e Google Drive como armazenamento, sem banco relacional próprio

- Status: aceito
- Data: 2026-08-19
- Dono: Emanuel
- Impacto no Data Mapping: sim

## Contexto

O casal quer visualizar confirmações de presença no Looker Studio e já lida com fotos/depoimentos guardando-os no próprio Google Drive. O prazo é de uma semana e o produto é descartável após o casamento — provisionar e operar um banco de dados próprio não se justifica pelo ciclo de vida do produto.

## Decisão

O backend (rotas do Next.js) grava cada confirmação de presença em uma planilha Google Sheets (uma linha por convidado: nome, e-mail, telefone, status, timestamp), que alimenta o Looker Studio diretamente. Fotos e mensagens são recebidas pelo servidor e reenviadas para a pasta do convidado no Google Drive, usando uma conta de serviço do Google — o convidado nunca fala diretamente com a API do Google.

## Alternativas consideradas

- Banco de dados relacional próprio (ex.: Postgres) + dashboard interno — descartada: exigiria provisionar infraestrutura, construir um painel de visualização e ainda replicar os dados pro Looker Studio; não se paga em uma semana para um produto descartável.
- Convidado enviando arquivo direto para o Drive via picker do Google (sem passar pelo servidor) — descartada porque o casal quer que o processo seja transparente ao convidado (ele não deve saber que o destino é o Drive) e por controle de validação (tipo/tamanho de arquivo) antes do envio.

## Consequências

- Fica mais fácil o casal visualizar dados sem construir um painel próprio.
- Fica mais difícil migrar para outro backend depois, caso o produto precise crescer — aceitável dado que o produto é descartável.
- Exige que a conta de serviço tenha só o escopo mínimo necessário (a planilha e as pastas do casal), e que a credencial nunca apareça em código versionado.
- Cria dependência de disponibilidade e cota das APIs do Google — registrado em `docs/architecture/risks.md`.
