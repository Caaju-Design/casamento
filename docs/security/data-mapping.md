# Data Mapping

> Documento auditável do tratamento de dados pessoais. Mantenha-o versionado junto ao código. Não registre senhas, chaves, tokens, dados reais de titulares ou detalhes que reduzam a segurança do ambiente.

| Campo | Valor |
| --- | --- |
| Produto / sistema | Site do casamento (`casamento.caaju.com.br`) |
| Escopo e ambientes cobertos | Produção e desenvolvimento local |
| Controlador | Casal (donos do casamento e do domínio) |
| Operadores e suboperadores | Google (Sheets, Drive, Docs) — armazenamento e visualização via Looker Studio; Vercel — hospedagem da aplicação |
| Responsável pelo documento | Emanuel |
| Status | rascunho |
| Última revisão | 2026-08-19 |
| Próxima revisão | Antes do lançamento em produção, ou a cada mudança de campo/fluxo |

## 1. Escopo e critérios

- **Finalidade do documento:** mapear o ciclo de vida dos dados pessoais dos convidados para governança, segurança e atendimento a eventuais pedidos dos titulares.
- **Fora de escopo:** dados internos do casal que não sejam de convidados (ex.: conteúdo estático do site, lista de presentes).
- **Critério de atualização:** atualizar este documento no mesmo pull request de qualquer mudança de arquitetura que altere coleta/campos, fluxo, armazenamento, acesso, mascaramento, integração, retenção, backup ou criptografia. Se não houver impacto, registrar a justificativa no pull request/ADR.

## 2. Histórico de alterações

| Data | Mudança arquitetural / ADR / PR | Impacto nos dados | Alteração realizada neste documento | Responsável |
| --- | --- | --- | --- | --- |
| 2026-08-19 | Bootstrap inicial do produto (ADR-0002, ADR-0003) | Criação da atividade de tratamento AT-001 | Documento criado | Emanuel |
| 2026-08-19 | Casal confirmou a data do casamento (17/04/2027) | Prazo de retenção deixa de ser estimativa | Seção 3 (retenção) e seção 6 (pendência removida) | Emanuel |

## 3. Inventário de atividades de tratamento

### AT-001 — Confirmação de presença, envio de foto e mensagem

| Item | Descrição |
| --- | --- |
| Titulares | Convidados do casamento |
| Categorias de dados | Identificação (nome), contato (e-mail, telefone), conteúdo enviado pela pessoa (foto, mensagem/depoimento), status de confirmação de presença |
| Dado pessoal sensível / criança ou adolescente? | Não identificado como sensível; possível presença de foto de criança/adolescente entre convidados — tratar com o mesmo cuidado dos demais dados, sem categoria diferenciada nesta v1 |
| Origem e método de coleta | Formulário no site, acessado via link pessoal único (`/convite/<token>`) |
| Finalidade específica | Confirmar presença no casamento; registrar foto/mensagem como lembrança para o casal; permitir visualização, pelo casal, do percentual de confirmação |
| Base legal | Consentimento — a pessoa preenche o formulário voluntariamente ao acessar seu link. O casal optou por não buscar validação jurídica formal (todos os titulares são familiares) — decisão do casal, registrada em 2026-08-19. |
| Sistemas e fluxo | Navegador do convidado → rota de API do Next.js (Vercel) → Google Sheets (linha de confirmação) e Google Drive (arquivo de foto/mensagem, pasta do convidado) |
| Local de armazenamento/processamento | Google Sheets (Workspace do casal) e Google Drive compartilhado — "Shared Drive" (ver ADR-0005; necessário porque a conta de serviço não tem cota própria em pasta comum), infraestrutura Vercel para a aplicação |
| Compartilhamento e operadores | Google (Sheets, Drive, Docs) como operador de armazenamento; Google Looker Studio como operador de visualização (só leitura da planilha) |
| Transferência internacional | Sim — infraestrutura do Google e da Vercel pode processar fora do Brasil; sem salvaguarda contratual adicional definida nesta v1 |
| Retenção, descarte e backups | Até 17 de abril de 2027 (data do casamento); após o prazo, exclusão da planilha e das pastas do Drive |
| Riscos e controles | Ver `docs/architecture/risks.md` (cota/indisponibilidade da API do Google); token de convite não sequencial (ADR-0003) |
| Canal de direitos do titular | Solicitação direta ao casal (contato informado no próprio convite); atendimento manual nesta v1 |

## 4. Matriz de acesso e mascaramento

| Campo ou categoria | Titular (o próprio convidado) | Casal | Outros convidados | Condição para acesso integral | Camada que aplica a regra |
| --- | --- | --- | --- | --- | --- |
| Nome | integral (só o próprio) | integral | nenhum | Acesso do casal é permanente (donos do dado); convidado só vê o próprio envio via seu token | Servidor (validação de token por requisição) + permissão de compartilhamento no Drive/Sheets |
| E-mail | integral (só o próprio) | integral | nenhum | Idem acima | Idem acima |
| Telefone | integral (só o próprio) | integral | nenhum | Idem acima | Idem acima |
| Foto / mensagem | integral (só a própria) | integral | nenhum | Idem acima | Idem acima |
| Status de confirmação | integral (só o próprio) | integral | nenhum | Idem acima | Idem acima |

Não há perfil de suporte, operador de cadastro ou admin técnico distinto do casal nesta v1 — só "titular" e "casal" existem como papéis.

## 5. Segurança e operação

- **Autenticação e autorização:** sem login; autorização por token de convite não sequencial, validado no servidor a cada requisição (ver ADR-0003).
- **Criptografia:** HTTPS/TLS em toda comunicação; dados em repouso protegidos pelas garantias do Google Workspace (Sheets/Drive) — sem criptografia adicional em nível de aplicação nesta v1.
- **Logs e auditoria:** logs da aplicação não registram corpo de requisição com dado pessoal nem o token de convite; erros de integração com o Google são logados sem o payload.
- **Incidentes:** dono é Emanuel; em caso de suspeita de vazamento do link de um convidado, o token correspondente é revogado (linha marcada como inválida na planilha de tokens).
- **Backups e restauração:** dependem do backup nativo do Google Workspace (histórico de versão do Sheets/Drive) — sem processo de restauração próprio nesta v1.

## 6. Pendências e validações

| Item | Impacto | Próximo passo | Dono | Data de revisão |
| --- | --- | --- | --- | --- |
| Definir se há necessidade de salvaguarda para transferência internacional (Google/Vercel) | Baixo | Avaliar se o volume/sensibilidade do dado justifica cláusula contratual adicional | Emanuel | 2026-08-26 |

## Arquivos e caminhos cobertos

- `app/convite/[token]/**` — coleta e exibição do formulário de RSVP/upload.
- `app/api/rsvp/**` — rota que grava na planilha Google Sheets.
- `app/api/upload/**` — rota que envia arquivo/mensagem para o Google Drive.
- `lib/google/**` — integração com as APIs do Google (Sheets, Drive, Docs).
