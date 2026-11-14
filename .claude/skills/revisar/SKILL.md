---
name: revisar
description: Etapa 1 da redação da Scuderia 49. Manda um rascunho do cofre para o agente Revisor, que dá um veredito e deixa sugestões como comentários dentro do texto. Use quando o autor disser /revisar, "revisa meu texto" ou similar.
argument-hint: "[parte do nome do rascunho]"
---

# /revisar: etapa 1 da redação

Rascunho pedido: `$ARGUMENTS`

1. **Ache o rascunho** em `content/10 - Box/` (ignore `.gitkeep`):
   - Com argumento: o `.md` cujo nome ou `title` contém o termo (sem diferenciar maiúsculas/acentos).
   - Sem argumento: o `.md` modificado mais recentemente.
   - Se houver mais de um candidato plausível, pergunte qual. Se não houver nenhum, diga que o Box está vazio e explique como criar um rascunho (nota nova dentro de `10 - Box`).
2. **Avise** numa linha: "Mandando *<título>* para o Revisor. Não edite esse texto no tablet até eu terminar (uns 2 minutos), pra não dar conflito no Syncthing."
3. **Chame o agente `revisor`** com o caminho completo do arquivo.
4. **Responda ao autor** com o resumo do Revisor (veredito + 3 pontos principais) e o próximo passo:
   > Abra o rascunho no Obsidian: as sugestões estão nos comentários 📝. Ajuste o que fizer sentido, apague os comentários resolvidos e mude o `status` para **aprovado**. Depois é só mandar `/editar`.
