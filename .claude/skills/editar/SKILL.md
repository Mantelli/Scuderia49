---
name: editar
description: Etapa 2 da redação da Scuderia 49. Manda um rascunho aprovado pelo autor para o agente Editor-chefe, que lapida o texto, coloca imagens e registra as mudanças. Use quando o autor disser /editar.
argument-hint: "[parte do nome do rascunho]"
disable-model-invocation: true
---

# /editar: etapa 2 da redação

Rascunho pedido: `$ARGUMENTS`

1. **Ache o rascunho** em `content/10 - Box/` como no /revisar (com argumento: nome ou `title` que contém o termo; sem argumento: o mais recente com `status: aprovado`).
2. **Confira o status** no frontmatter:
   - `aprovado` → segue.
   - `revisado` ou `rascunho` → não siga. Explique que o Editor-chefe só entra depois da aprovação: o autor ajusta o texto e muda o `status` para `aprovado`. Se o autor disser explicitamente para editar mesmo assim, siga.
   - `editado` → avise que já foi editado e pergunte se quer editar de novo.
3. **Avise** numa linha que o texto está com o Editor-chefe e que não deve ser mexido no tablet por uns minutos.
4. **Chame o agente `editor-chefe`** com o caminho completo do arquivo.
5. **Responda** com o resumo do editor (o que mudou, imagens, pendências) e o próximo passo:
   > Dê uma lida no Obsidian (o registro ✂️ está no topo; o original ficou guardado em `content/.originais/`). Se estiver tudo certo, mande `/publicar`.
