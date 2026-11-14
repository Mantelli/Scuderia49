# Scuderia 49

> A Garagem Onde as Máquinas Têm Alma.

Blog de cultura automotiva, feito com [Astro](https://astro.build) e publicado no GitHub Pages em <https://scuderia49.com.br>.

## Como escrever

Os textos são escritos no **Obsidian**. Abra a pasta `content/` como cofre (não a raiz do repositório). O fluxo é **ideia → box → linha de montagem**:

| Pasta                            | O que é                                                                     |
| -------------------------------- | --------------------------------------------------------------------------- |
| `content/🏁 Painel.md`           | Painel de pauta: ideias, rascunhos, publicados e cola rápida da sintaxe.    |
| `content/00 - Caixa de Ideias`   | Notas novas caem aqui. Captura rápida, nada é publicado.                    |
| `content/10 - Box`               | Rascunhos. Nota criada aqui vira esqueleto de Dossiê ou Pit Stop.           |
| `content/20 - Linha de Montagem` | Publicados. Só os `.md` desta pasta viram páginas.                          |
| `content/80 - Templates`         | Templates do Templater (Nova Ideia, Novo Post, Ideia vira rascunho, Publicar). |
| `content/90 - Setup/Assets`      | Imagens (o Obsidian salva os anexos aqui).                                  |
| `content/index.md`               | Texto da página **Sobre**.                                                  |

Os comandos **🔧 Ideia vira rascunho** e **🏁 Publicar** ficam na paleta de comandos (`Templater: Insert …`). O de publicar confere o texto, carimba a data, adiciona a tag `post` e move a nota para a Linha de Montagem.

Frontmatter de um post (os templates preenchem):

```yaml
---
title: "Título do post"
slug: titulo-do-post # endereço: /posts/titulo-do-post
date: 2026-11-14
tags: [editorial, cultura-automotiva, post] # "post" é obrigatório; "pit-stop" marca nota rápida
status: Postado # "rascunho" não é publicado
image: "[[capa.jpg]]" # capa opcional (card, topo do post e compartilhamento)
imageAlt: "Descrição da capa"
---
```

O que funciona como no Obsidian:

- `> [!ABSTRACT] O Lead` vira a ficha de abertura e também a descrição do post no Google e nas redes.
- `> [!TIP] Nota do Autor` vira o bilhete com fita adesiva. Um callout sem conteúdo não é publicado.
- `![[imagem.jpg]]` encontra a imagem em qualquer pasta do cofre e otimiza automaticamente.
- `%% anotação %%` nunca vai ao ar.
- Fórmulas entre `$...$` são renderizadas.

O visual do site dentro do Obsidian vem do snippet `content/.obsidian/snippets/scuderia49.css`.

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

### Publicação automática a partir do cofre

Um timer do systemd neste PC roda `scripts/publicar-cofre.sh` a cada 2 minutos. Quando algo muda em `20 - Linha de Montagem`, `90 - Setup/Assets` ou `index.md`, o script:

1. espera os arquivos ficarem parados por 1 minuto (o Syncthing pode estar copiando);
2. testa o build do site (se quebrar, não envia e avisa por notificação);
3. faz o commit com o título do post, sincroniza com o GitHub e faz o push.

Ideias e rascunhos (`00 - Caixa de Ideias`, `10 - Box`) nunca são enviados: o repositório é público. O script só age na branch `v4`.

```bash
scripts/instalar-publicacao-automatica.sh                 # instalar ou atualizar
journalctl --user -u scuderia49-publicar -f               # acompanhar o log
systemctl --user disable --now scuderia49-publicar.timer  # desligar
```
