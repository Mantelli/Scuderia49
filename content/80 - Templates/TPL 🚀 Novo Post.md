<%*
const slugify = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60).replace(/-+$/, "");
const semTitulo = /^(Sem título|Untitled)/i.test(tp.file.title);
let titulo = semTitulo ? await tp.system.prompt("Título do post") : tp.file.title;
if (!titulo) titulo = "Novo post";
const formato = (await tp.system.suggester(
  ["🏎️ Dossiê: texto longo, com história e pesquisa", "⛽ Pit Stop: nota rápida, 200 a 400 palavras"],
  ["dossie", "pit-stop"], false, "Qual o formato?")) ?? "dossie";
const slug = slugify(titulo);
const hoje = tp.date.now("YYYY-MM-DD");
await tp.file.move(`10 - Box/${hoje}-${slug}`);
-%>
---
title: <% JSON.stringify(titulo) %>
slug: <% slug %>
date: <% hoje %>
tags:
  - <% formato === "pit-stop" ? "pit-stop" : "editorial" %>
  - cultura-automotiva
status: rascunho
image:
imageAlt:
---
<%* if (formato === "dossie") { -%>
> [!ABSTRACT] O Lead
> <% tp.file.cursor(1) %>

%% O LEAD aparece na capa do site, no Google e no WhatsApp. Duas ou três frases que deixem o leitor com vontade de ler o resto. %%

## A Largada

%% Comece pela cena: o cheiro, o barulho, o momento. Prenda pelo sentimento antes da informação. %%

## Título que conta a história

%% Use subtítulos que façam parte da narrativa, não categorias ("O dia em que o motor calou"). Parágrafos médios, bons de ler no celular. Para foto: arraste a imagem para cá ou escreva ![[foto.jpg]]. %%

> [!TIP] Nota do Autor
> %% Bastidor ou curiosidade técnica que quebraria o ritmo do texto. Se não usar, pode deixar assim: o bloco some sozinho no site. %%

## A Bandeirada

%% O fecho: amarre os pontos e deixe uma reflexão ou provocação. Não é resumo, é o encerramento da experiência. %%

---
**Escrito por Ramon Mantelli** *Fundador da Scuderia 49 — A alma das máquinas, documentada em pixels.*
<%* } else { -%>
%% PIT STOP: uma ideia, uma opinião ou um achado. 200 a 400 palavras, sem pesquisa pesada. O primeiro parágrafo vira o resumo no site, então comece forte. %%

<% tp.file.cursor(1) %>

%% Feche com uma pergunta ou provocação para o leitor. %%

---
**Escrito por Ramon Mantelli** *Fundador da Scuderia 49 — A alma das máquinas, documentada em pixels.*
<%* } -%>
