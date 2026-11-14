<%*
if (/^(Sem título|Untitled)/i.test(tp.file.title)) {
  const ideia = await tp.system.prompt("Qual é a ideia? (uma frase basta)");
  if (ideia) await tp.file.rename(ideia.replace(/[\\/:*?"<>|#^\[\]]/g, "").trim().slice(0, 90));
}
-%>
---
status: ideia
criado: <% tp.date.now("YYYY-MM-DD") %>
---
<% tp.file.cursor(1) %>

%% Anote o que vier: a faísca, um link, uma foto, um argumento, uma frase de efeito. Quando a ideia ganhar corpo, rode o comando "🔧 Ideia vira rascunho". %%
