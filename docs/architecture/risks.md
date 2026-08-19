# Riscos

Riscos contínuos que ficam monitorados até o casamento, diferentes de tarefa com dono e prazo (ver `docs/product/pendencias.md`).

| Risco | Probabilidade | Impacto | Mitigação | Dono | Sinal de alerta |
| --- | --- | --- | --- | --- | --- |
| Cota/indisponibilidade da API do Google (Sheets/Drive) | Baixa | Alto — bloqueia RSVP e upload no momento em que convidados mais acessam | Tratar erro da API com estado "backend indisponível" e retry manual; monitorar cota no console do Google | Emanuel | Erros de API do Google nos logs da aplicação |
| Token de convite adivinhado ou compartilhado indevidamente | Baixa | Médio — pessoa fora da lista confirma presença | Token não sequencial, gerado com entropia suficiente; sem exposição do token em log | Emanuel | Confirmação de presença de nome fora da lista original |
| Volume de fotos maior que o esperado no dia do evento | Média | Médio — lentidão no upload ou custo de armazenamento no Drive | Limite de 10MB por arquivo, feedback de progresso no upload, sem limite de quantidade de fotos | Emanuel | Reclamação de lentidão no upload durante o evento |
