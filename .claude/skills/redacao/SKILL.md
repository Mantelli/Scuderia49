---
name: redacao
description: Mostra a situação da redação da Scuderia 49 (o que está no Box, em que etapa cada rascunho está e qual o próximo passo). Use quando o autor disser /redacao, "como está a pauta" ou perguntar o que fazer agora.
---

# /redacao: painel da redação

1. Liste os `.md` de `content/10 - Box/` lendo o frontmatter de cada um (`title`, `status`, `tags`) e a data de modificação. Conte as palavras do corpo, ignorando frontmatter e comentários `%% %%`.
2. Liste quantas ideias há em `content/00 - Caixa de Ideias/` (títulos das 5 mais recentes).
3. Veja a data do post mais recente em `content/20 - Linha de Montagem/` e há quantos dias foi.
4. Responda com uma tabela curta:

| Rascunho | Formato | Palavras | Etapa | Próximo passo |
|---|---|---|---|---|

   Etapas: `rascunho` → escrever e mandar `/revisar` · `revisado` → ajustar, aprovar e `/editar` · `aprovado` → `/editar` · `editado` → `/publicar`.
5. Feche com uma linha de incentivo concreta e honesta (ex.: "Faz 9 dias do último post; o Pit Stop sobre X está a 120 palavras de ficar pronto").
