# Matriz de estados

Estados que toda tela com UI deste produto trata — sem sessão/autenticação, já que não há login (ver ADR-0003).

| Estado | Quando ocorre | O que a interface mostra |
| --- | --- | --- |
| Carregando | Envio do RSVP/foto/mensagem em andamento | Indicador de carregamento no botão de envio, sem duplicar o envio |
| Timeout | API do Google não responde a tempo | Mensagem específica pedindo para tentar de novo, sem parecer erro genérico |
| Backend indisponível | Rota de API fora do ar ou API do Google indisponível (ver `docs/architecture/risks.md`) | Mensagem específica, com sugestão de tentar novamente mais tarde |
| Offline | Convidado sem conexão no momento do envio | Aviso de offline, sem simular sucesso de envio |
| Vazio (empty state) | Não se aplica a conteúdo estático da home; aplica-se à confirmação de presença ainda não enviada | Convite mostra que a confirmação ainda não foi feita, com o formulário em destaque |
| Busca sem resultado | Não se aplica — não há busca no produto | — |
| Cancelamento | Convidado interrompe o upload de foto em andamento | Confirma que o envio foi cancelado, sem estado ambíguo |
| Erro de validação | Campo obrigatório vazio, e-mail inválido, foto com tipo/tamanho não permitido | Erro perto do campo específico, dizendo o que corrigir |
| Permissão negada | Acesso à câmera/galeria negado pelo navegador | Mensagem explica o que falta e como liberar a permissão |
| Token inválido/não encontrado | Link de convite não corresponde a nenhum convidado da lista | Mensagem de que o convite não foi encontrado, com orientação para falar com o casal — nunca expõe detalhe técnico do token |
| Limite de taxa excedido | Convidado envia requisições repetidas além do limite (proteção contra abuso do formulário público) | Informa que é temporário, sem tratar como erro genérico |

- Sessão expirada/revogada, erro de autenticação e conta já conectada não entram nesta matriz — não há login no produto (ver ADR-0003).
- Copy de cada estado segue `docs/product/brand/tom-de-voz.md`.
