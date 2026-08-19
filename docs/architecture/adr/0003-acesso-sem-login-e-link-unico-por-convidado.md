# ADR-0003: Sem login, acesso por link único e pessoal por convidado

- Status: aceito
- Data: 2026-08-19
- Dono: Emanuel
- Impacto no Data Mapping: sim

## Contexto

O casal precisa impedir que pessoas fora da lista de convidados confirmem presença, mas não quer exigir login nem busca de nome (fricção para convidados menos familiarizados com tecnologia). A visualização de quem confirmou será feita pelo Looker Studio, não por um painel autenticado dentro do site.

## Decisão

Cada convidado recebe um link pessoal (`/convite/<token>`), gerado a partir da lista de convidados preparada pelo casal antes do envio dos convites. O token identifica o convidado e autoriza a confirmação de presença, sem exigir senha nem busca de nome. O mesmo link permanece válido antes e durante o casamento, para reenvio de fotos/mensagens. Não existe login para o casal — a visualização das confirmações é feita pelo Looker Studio, fora do site.

## Alternativas consideradas

- Login com e-mail/senha para o casal, com painel próprio de confirmações — descartada durante a entrevista: o casal já teria a visualização pelo Looker Studio, tornando o painel redundante para o ciclo de vida curto do produto.
- Busca de nome pelo próprio convidado, sem link único — descartada porque o casal exigiu impedir confirmação de pessoas fora da lista, e nomes duplicados/parecidos tornariam a busca ambígua.

## Consequências

- Fica mais fácil convidar via WhatsApp/e-mail, só mandando o link — sem instrução de login.
- Fica mais difícil adicionar um convidado depois de os links já terem sido distribuídos, sem reabrir o processo de geração de tokens.
- Exige que o token seja imprevisível (não sequencial) para não ser adivinhado por alguém fora da lista — validado no servidor a cada requisição.
