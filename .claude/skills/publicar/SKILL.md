---
name: publicar
description: Etapa 3 da redação da Scuderia 49. Manda um post editado para o agente Conferente, que faz a checagem final e publica no site. Use somente quando o autor disser /publicar.
argument-hint: "[parte do nome do rascunho]"
disable-model-invocation: true
---

# /publicar: etapa 3 da redação

Post pedido: `$ARGUMENTS`

1. **Ache o post** em `content/10 - Box/` (com argumento: nome ou `title` que contém o termo; sem argumento: o mais recente com `status: editado`).
2. **Confira o status**: precisa ser `editado`. Se não for, explique em que etapa ele está (`rascunho` → /revisar; `revisado` → aprovar e /editar; `aprovado` → /editar). Só siga se o autor disser explicitamente para publicar mesmo assim, e nesse caso diga isso ao Conferente.
3. **Chame o agente `conferente`** com o caminho completo do arquivo.
4. **Responda**:
   - Publicado: título, link `https://scuderia49.com.br/posts/<slug>/`, avisos restantes e "o site atualiza em cerca de 1 minuto".
   - Bloqueado: a lista de bloqueios e como resolver (também ficou registrada no topo do arquivo, num comentário 🏁).
