# Scuderia 49

> A Garagem Onde as Máquinas Têm Alma.

Blog de cultura automotiva, feito com [Astro](https://astro.build) e publicado no GitHub Pages em <https://scuderia49.com.br>.

## Como escrever

Os textos continuam sendo escritos no **Obsidian**, dentro de `content/` (o vault):

| Pasta                           | O que é                                                   |
| ------------------------------- | --------------------------------------------------------- |
| `content/20 - Linha de Montagem` | Posts (dossiês). Só os `.md` desta pasta viram páginas.  |
| `content/80 - Templates`         | Modelo de post do Templater (não é publicado).            |
| `content/90 - Setup/Assets`      | Imagens usadas nos posts.                                 |
| `content/index.md`               | Texto da página **Sobre**.                                |

Frontmatter de um post:

```yaml
---
title: "Título do dossiê"
slug: titulo-do-dossie # endereço: /posts/titulo-do-dossie (opcional)
date: 2026-11-14
tags: [editorial, cultura-automotiva, post] # "post" é obrigatório para publicar
status: Postado # "rascunho" não é publicado
image: "../90 - Setup/Assets/capa.jpg" # capa opcional (aparece nos cards)
imageAlt: "Descrição da capa"
---
```

O que funciona como no Obsidian:

- `> [!ABSTRACT] O Lead` vira a ficha de abertura e também a descrição do post no Google e nas redes.
- `> [!TIP] Nota do Autor` vira o bilhete com fita adesiva.
- `![[imagem.jpg]]` encontra a imagem em qualquer pasta do vault e otimiza automaticamente.
- Fórmulas entre `$...$` são renderizadas.

## Rodar localmente

Requer Node 22.23 ou mais novo.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # gera o site em dist/
npm run check    # checagem de tipos
```

## Publicação

Todo push na branch `v4` roda `.github/workflows/deploy.yml`, que gera o site e publica no GitHub Pages.
