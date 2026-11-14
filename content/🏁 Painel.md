# 🏁 Painel da Scuderia

> [!TIP] Ritmo de pista
> Meta: **1 Pit Stop por semana** e **1 Dossiê por mês**.
> O Pit Stop é curto (200 a 400 palavras): uma opinião, um achado, uma foto com história. É ele que mantém o site vivo entre um Dossiê e outro.

## ⚡ Como usar

| Quero…                    | Faço assim                                                                                     |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| Anotar uma ideia          | Criar uma nota nova. Ela cai na **Caixa de Ideias** e pede a ideia numa frase.                 |
| Começar um post           | Criar uma nota dentro de **10 - Box**. Ele pergunta título e formato e monta o esqueleto.     |
| Transformar ideia em post | Com a ideia aberta: paleta de comandos → **Templater: Insert … 🔧 Ideia vira rascunho**        |
| Publicar                  | Com o rascunho aberto: paleta de comandos → **Templater: Insert … 🏁 Publicar**                |

O comando de publicar confere o texto antes (Lead vazio, texto curto, capa sem descrição), carimba a data de hoje e move o post para a **Linha de Montagem**. Daí em diante é sozinho: o Syncthing leva o post para o PC, que envia ao GitHub, e o site atualiza em uns **3 minutos**. O PC precisa estar ligado e com sua sessão aberta. Corrigiu algo num post já publicado? É só salvar, que vai do mesmo jeito.

## 🤖 Redação com agentes

Para não publicar sozinho, mande o rascunho para a redação no Claude Code (no PC, nesta pasta do projeto):

| Etapa | Você manda | Quem age | O que acontece | `status` depois |
| ----- | ---------- | -------- | -------------- | --------------- |
| 1 | `/revisar` | ✍️ Revisor | Dá um veredito e deixa sugestões `%% 📝 %%` no texto, sem reescrever nada | `revisado` |
| 2 | (você) | Você | Ajusta o que fizer sentido, apaga os 📝 resolvidos e muda o status | `aprovado` |
| 3 | `/editar` | ✂️ Editor-chefe | Lapida mantendo sua voz, confere fatos, põe imagens e registra tudo no topo (✂️). Guarda o original em `.originais` | `editado` |
| 4 | `/publicar` | 🏁 Conferente | Confere tudo, roda o build, limpa os comentários da redação e publica | `Postado` |

`/redacao` mostra em que etapa está cada rascunho. Enquanto um agente trabalha num texto, não edite esse texto no tablet.

O caminho rápido continua valendo: o comando **🏁 Publicar** do Templater publica direto, sem passar pela redação.

## 🔧 No Box (rascunhos)

```base
filters:
  and:
    - file.inFolder("10 - Box")
properties:
  file.name:
    displayName: Rascunho
  file.mtime:
    displayName: Mexido em
views:
  - type: table
    name: No Box
    order:
      - file.name
      - status
      - tags
      - file.mtime
    sort:
      - property: file.mtime
        direction: DESC
```

## 💡 Caixa de Ideias

```base
filters:
  and:
    - file.inFolder("00 - Caixa de Ideias")
properties:
  file.name:
    displayName: Ideia
  criado:
    displayName: Anotada em
views:
  - type: table
    name: Ideias
    order:
      - file.name
      - criado
    sort:
      - property: file.ctime
        direction: DESC
```

## 🏁 Na pista (publicados)

```base
filters:
  and:
    - file.inFolder("20 - Linha de Montagem")
properties:
  title:
    displayName: Post
  date:
    displayName: Publicado em
views:
  - type: table
    name: Publicados
    order:
      - title
      - date
      - tags
    sort:
      - property: date
        direction: DESC
    limit: 10
```

## ✍️ Cola rápida

- **O Lead:** `> [!ABSTRACT] O Lead`. Vira a ficha de abertura e o resumo no Google e no WhatsApp.
- **Nota do Autor:** `> [!TIP] Nota do Autor`. Vira o bilhete com fita adesiva.
- **Foto no texto:** arraste a imagem para a nota. Ela vai para `90 - Setup/Assets` e entra como `![[foto.jpg]]`.
- **Capa do post:** no campo `image`, escreva `[[foto.jpg]]`, e em `imageAlt` descreva a foto. Ela aparece no card da home, no topo do post e no compartilhamento.
- **Anotação que não vai ao ar:** `%% assim %%`. Serve para lembretes, fontes e frases soltas.
- **Separador:** `---` vira a bandeirada quadriculada.
- **Fórmula:** `$90^\circ$`.
