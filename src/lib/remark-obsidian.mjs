// Traduz a sintaxe do Obsidian usada nos posts para Markdown/HTML comum:
//   > [!TIPO] Título   → <aside class="callout callout-tipo">
//   ![[imagem.jpg]]     → imagem otimizada pelo Astro (procurada em content/)
import fs from "node:fs"
import path from "node:path"
import { visit } from "unist-util-visit"

const CONTENT_DIR = path.resolve("content")
const IGNORE = new Set([".obsidian", ".trash", ".stversions", ".stfolder", "node_modules"])

/** Mapa nome-do-arquivo → caminho absoluto (o Obsidian resolve embeds pelo nome). */
function indexFiles(dir, map = new Map()) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) indexFiles(full, map)
    else if (!map.has(entry.name)) map.set(entry.name, full)
  }
  return map
}

const CALLOUT_LABELS = {
  abstract: "O Lead",
  summary: "Resumo",
  tip: "Dica",
  note: "Nota",
  info: "Info",
  warning: "Atenção",
  quote: "Citação",
}

const EMBED_RE = /!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g
const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif|svg)$/i

export function remarkObsidian() {
  let files
  return (tree, file) => {
    files ??= indexFiles(CONTENT_DIR)
    const fromDir = path.dirname(file.path ?? path.join(CONTENT_DIR, "x.md"))

    // 1) Embeds de imagem: ![[arquivo.jpg]] ou ![[arquivo.jpg|legenda]]
    visit(tree, "text", (node, index, parent) => {
      if (!parent || index == null || !node.value.includes("![[")) return
      const parts = []
      let last = 0
      for (const m of node.value.matchAll(EMBED_RE)) {
        const [raw, name, alias] = m
        const target = files.get(name.trim())
        if (!target || !IMAGE_EXT.test(name)) continue
        if (m.index > last) parts.push({ type: "text", value: node.value.slice(last, m.index) })
        const alt = alias?.trim() || name.replace(IMAGE_EXT, "").replace(/[-_]/g, " ")
        parts.push({
          type: "image",
          url: path.relative(fromDir, target).split(path.sep).join("/"),
          alt,
          title: alias?.trim() || null,
        })
        last = m.index + raw.length
      }
      if (!parts.length) return
      if (last < node.value.length) parts.push({ type: "text", value: node.value.slice(last) })
      parent.children.splice(index, 1, ...parts)
      return index + parts.length
    })

    // 2) Callouts: > [!TIPO] Título opcional
    visit(tree, "blockquote", (node) => {
      const first = node.children[0]
      const head = first?.type === "paragraph" ? first.children[0] : null
      if (head?.type !== "text") return
      const m = head.value.match(/^\[!(\w+)\][+-]?[ \t]*([^\n]*)\n?/)
      if (!m) return
      const kind = m[1].toLowerCase()
      const title = m[2].trim() || CALLOUT_LABELS[kind] || m[1]
      head.value = head.value.slice(m[0].length)
      if (!head.value) first.children.shift()
      // remove a quebra de linha que sobra no início do parágrafo
      if (first.children[0]?.type === "break") first.children.shift()
      if (!first.children.length) node.children.shift()

      node.data = {
        hName: "aside",
        hProperties: { className: ["callout", `callout-${kind}`] },
      }
      node.children.unshift({
        type: "paragraph",
        data: { hProperties: { className: ["callout-title"] } },
        children: [{ type: "text", value: title }],
      })
    })
  }
}
