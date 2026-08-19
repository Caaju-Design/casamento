# Estado do bootstrap

Registro de retomada do bootstrap deste produto — permite continuar em outra sessão sem repetir a entrevista.

- **Produto:** Site de casamento (RSVP, presentes via Pix, upload de fotos/depoimentos, recomendações de hospedagem).
- **Casal:** Emanuel & Gabriela.
- **Data, horário e local do casamento:** 17/04/2027, 16h00, Ed. Square 2 (salão de festa) — Rua Luís Correia de Melo, 86, Chácara Santo Antônio, São Paulo, CEP 04726-220.
- **Etapa atual:** Etapa 4 (criação) — proposta aprovada em 2026-08-19.
- **Próximo passo:** resolver as pendências de infraestrutura em `docs/product/pendencias.md` (Drive compartilhado, conteúdo da lista de presentes, deploy na Vercel), depois marcar esta etapa como concluída.

## Infraestrutura (progresso real, 2026-08-19)

- Repositório: `git@github.com:Caaju-Design/casamento.git` (privado, push feito).
- Google Cloud: projeto `casamento-caaju`, APIs Sheets/Drive/Docs habilitadas, conta de serviço `casamento-rsvp@casamento-caaju.iam.gserviceaccount.com` criada, credenciais em `.env.local` (nunca versionado).
- Planilha de RSVP real: `1wGvjG-EfWcFaKOkIZxskoF3dAuINJ9N1_WsypCA53sc`, aba renomeada para "Convidados", 90 convidados já cadastrados com nome — links de convite gerados via `npm run invites:generate` (ver `scripts/generate-invite-links.mjs`).
- Testado de ponta a ponta contra dado real: leitura do convite e confirmação de presença (RSVP) funcionam. Upload de foto/mensagem bloqueado por limitação de cota de conta de serviço no Drive — ver ADR-0005, resolução em andamento (Drive compartilhado).
- Vercel: ainda não implantado.

## Respostas da entrevista

### Problema e resultado
- Objetivo: centralizar informações do casamento e permitir que convidados confirmem presença, enviem fotos/mensagens e vejam a lista de presentes (Pix).
- Sucesso: casal consegue ver o percentual de convidados que confirmaram e quem ainda não confirmou, sem precisar responder perguntas manuais sobre "como confirmar". Nenhum convidado fora da lista consegue confirmar presença.
- Fora de escopo: nada — tudo entra na v1 (prazo de 1 semana).

### Formato
- Web responsivo, one-page com âncoras de menu.
- Prazo: 1 semana até o site estar no ar.
- Domínio: `casamento.caaju.com.br`.
- Acesso público, sem senha de convite — mas cada convidado usa um link pessoal único.

### Pessoas e acesso
- Só convidados (público) e o casal têm relação com o site. Nenhuma outra pessoa (cerimonialista, madrinha) precisa de acesso.
- **Sem login** — decisão revertida durante a entrevista: o casal visualiza confirmações pelo Looker Studio (conectado à planilha que o site alimenta), não por um painel próprio.
- Precisa de permissão de dispositivo: câmera/galeria, para upload de foto.

### Dados e integrações
- Dados guardados: nome, e-mail, telefone, status de confirmação, foto, mensagem/depoimento.
- Fotos e depoimentos ficam hospedados no Google Drive do casal (uma pasta por convidado), não em armazenamento próprio — mas o upload acontece por dentro do site (front próprio), de forma transparente para o convidado.
- Pix: código copia-e-cola + QR code estático gerados pelo casal, sem gateway de pagamento, sem registro de quem pagou (é presente).
- Looker Studio: conectado a uma planilha Google Sheets alimentada pelo site, só para visualização (percentual de confirmação, quem falta). Casal não quer controlar nada por lá além de visualizar.
- Sem persistência em banco relacional próprio — Google Sheets/Drive fazem esse papel.

### Operação e entrega
- Publica e ajusta pontualmente até o casamento (sem deploy contínuo formal, mas Vercel redeploya a cada push).
- Repositório privado.
- Hospedagem: Vercel (aberto a mudar).

### Marca
- Tom: romântico, emocionante, copy que gera acolhimento e felicidade.
- Visual: estilo Bridgerton, efeitos three.js decorativos no scroll.

## Blocos condicionais ativados

| Bloco | Confirmado | Detalhe |
| --- | --- | --- |
| Dado pessoal | Sim | Nome, e-mail, telefone, foto, mensagem — ver `docs/security/data-mapping.md` |
| Uploads | Sim | Só imagem (sem vídeo), sem limite de quantidade, limite de 10MB por arquivo, validado no servidor |
| Pagamentos | Sim (informacional) | Pix estático, sem gateway, sem registro de pagador — não ativa checklist Crítico |
| Design system | Sim | Criado do zero, estilo Bridgerton — ver ADR-0001 |
| 3D | Sim | three.js decorativo, precisa funcionar em celular fraco — ver ADR e `docs/design-system/acessibilidade.md` |
| Login | **Não** | Decisão revertida durante a entrevista — ver ADR-0003 |
| Multitenant, API pública, filas, mobile nativo, IA, white label, setor regulado, analytics de terceiro | Não | Não se aplicam |

## Exceções legais — respostas registradas

- **Acessibilidade (Lei 13.146):** avisado que é exigência legal para produto de uso público. O casal optou explicitamente por **não aplicar** os critérios de acessibilidade (WCAG) nesta v1, incluindo `prefers-reduced-motion` no efeito three.js. Decisão do casal, não do agente. Registrado também em `docs/design-system/acessibilidade.md`.
- **Data Mapping (LGPD):** não houve pedido para dispensar — construído normalmente em `docs/security/data-mapping.md`, dado que o produto guarda dado pessoal.

## Cardápio de artefatos opcionais — respostas

1. Guia de tom de voz e persona — **sim**, criado em `docs/product/brand/tom-de-voz.md`.
2. Tema claro/escuro — **não**, só um visual (claro, Bridgerton).
3. Runbook de operação — **sim**, mesmo sem deploy contínuo formal.
4. ADR retroativo — **não se aplica**: projeto novo, sem decisão anterior a este bootstrap. As decisões desta entrevista entram como ADRs normais (0001-0003).
5. Storybook/catálogo visual — não.
6. Ambiente de staging separado — não.
7. Página de status público — **revertido para não** em 2026-08-19 (confirmado após a proposta): o casal quer, em vez disso, que a própria página `/convite/[token]` mostre "presença já confirmada" quando o convidado revisitar o link — funcionalidade que já nasce coberta pelo fluxo de RSVP (`components/organisms/RsvpFlow.tsx`, prop `alreadyConfirmed`), sem artefato adicional.

## Decisões e critérios (Etapa 3)

| Decisão | Critério |
| --- | --- |
| Porte de teste: **Mínimo** | Prazo de 1 semana, 1-2 pessoas cuidando do projeto, site descartável após o casamento |
| Nível de segurança: **Base + LGPD** | Dado pessoal presente; sem login (não é Elevado); sem processamento de pagamento no servidor próprio, sem multitenancy, sem API pública (não é Crítico) |
| Sem checklist BaaS | Guests nunca falam direto com Google — tudo passa pelo servidor próprio (Next.js), que aplica as regras de acesso |
| Sem `site-map.md` | Só 2 padrões de rota (`/` e `/convite/[token]`) — gatilho é mais de 3 rotas |
| Sem `mer.md` | Não há banco relacional próprio com 5+ entidades — Sheets/Drive não contam |

## Pendências abertas

Ver `docs/product/pendencias.md`.
