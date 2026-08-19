# Inventário de componentes

Referência de todo componente existente, sua camada (Atomic Design) e onde é usado — consultar antes de criar componente novo (ver ADR-0001).

| Componente | Camada | Onde é usado |
| --- | --- | --- |
| `Button` | Atom | RSVP, upload, navegação de âncora |
| `Input` / `TextArea` | Atom | Formulário de RSVP (nome, e-mail, telefone, mensagem) |
| `Heading` / `Text` | Atom | Todas as seções |
| `Icon` | Atom | Menu, estados (erro, sucesso) |
| `FormField` (label + input + mensagem de erro) | Molecule | Formulário de RSVP |
| `PhotoDropzone` (seleção de arquivo + preview) | Molecule | Envio de foto no convite pessoal |
| `GiftCard` (presente + botão de Pix) | Molecule | Seção de lista de presentes |
| `AnchorNav` (menu de âncoras) | Molecule | Topo da página one-page |
| `RsvpForm` | Organism | Página `/convite/[token]` |
| `RsvpFlow` | Organism | Orquestra o estado vazio (formulário) e o de sucesso (depoimento + presentes) na página `/convite/[token]` — introduzido na implementação |
| `InviteNotFound` | Organism | Estado de token inválido/não encontrado na página `/convite/[token]` — introduzido na implementação |
| `HeroSection` (com cena three.js) | Organism | Topo da home |
| `GiftListSection` | Organism | Página `/convite/[token]`, exibida após confirmação (não na home — decisão de implementação) |
| `TestimonialSection` | Organism | Coleta de depoimento no convite pessoal |
| `RecommendationsSection` (hospedagem/restaurantes) | Organism | Home |
| `InvitePageTemplate` | Template | Esqueleto da página `/convite/[token]` |
| `HomePageTemplate` | Template | Esqueleto da home one-page (seções "Nossa história" e "O evento" ficam compostas direto no template, sem organism próprio — conteúdo simples, sem estado) |

Atualizar esta tabela no mesmo PR que introduzir, remover ou mudar de camada um componente.
