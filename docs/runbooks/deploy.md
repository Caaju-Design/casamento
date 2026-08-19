# Runbook de deploy

Procedimento de deploy e rollback, e o que fazer na falha mais provável deste produto — pedido explícito no cardápio de artefatos, mesmo sem deploy contínuo formal.

## Deploy

1. Merge na branch principal (`main`) via pull request revisado.
2. Vercel builda e publica automaticamente a partir da `main`.
3. Verificar manualmente após o deploy: home carrega, uma página de convite de teste (`/convite/<token-de-teste>`) confirma presença e recebe upload de foto com sucesso.

## Rollback

1. Na Vercel, promover o deploy anterior (última versão estável) de volta para produção — não exige reverter commit.
2. Se o problema for em uma migration de dados (ex.: estrutura da planilha mudou), avaliar à parte: reverter estrutura da planilha manualmente antes de promover o deploy anterior.

## Falha mais provável: API do Google indisponível ou cota excedida

- **Sintoma:** convidado recebe estado de "backend indisponível" ao confirmar presença ou enviar foto (ver `docs/design-system/matriz-estados.md`).
- **Quem aciona:** Emanuel — verificar console do Google Cloud (cota da API de Sheets/Drive) e status da própria API do Google.
- **Mitigação imediata:** se for cota, aguardar reset (diário) ou solicitar aumento de cota; se for indisponibilidade do Google, comunicar ao casal para avisar convidados manualmente enquanto o serviço não normaliza.
- **Depois de resolvido:** confirmar que envios represados (se algum foi perdido) precisam ser recuperados manualmente com o convidado afetado.

## Falha secundária: token de convite não encontrado em massa

- **Sintoma:** vários convidados reportam "convite não encontrado".
- **Causa provável:** planilha/lista de tokens foi editada incorretamente.
- **Ação:** restaurar a partir do histórico de versões do Google Sheets (Arquivo → Histórico de versões).
