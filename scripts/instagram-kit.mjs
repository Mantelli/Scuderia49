#!/usr/bin/env node
// Gera o "kit Instagram" de um post publicado: carrossel 1080x1350 na identidade
// da Scuderia 49 + legenda pronta. Saída em "content/70 - Instagram/<slug>/"
// (fora do git; o Syncthing leva para o celular).
//
// Uso:
//   node scripts/instagram-kit.mjs                 -> todos os posts publicados
//   node scripts/instagram-kit.mjs <slug> [...]    -> só esses
//   node scripts/instagram-kit.mjs <slug> --fotos a.jpg,b.jpg   -> escolhe as fotos do miolo
//   --refazer-legenda   sobrescreve legenda.txt (por padrão ela é preservada se já existir,
//                       para não apagar ajustes feitos à mão)

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import satori from "satori"
import { Resvg } from "@resvg/resvg-js"
import sharp from "sharp"
import { parse as parseYaml } from "yaml"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const POSTS = path.join(ROOT, "content/20 - Linha de Montagem")
const ASSETS = path.join(ROOT, "content/90 - Setup/Assets")
const OUT = path.join(ROOT, "content/70 - Instagram")
const SITE = "scuderia49.com.br"
const W = 1080
const H = 1350

const C = {
  paper: "#f3ead5", paper2: "#ebe0c6", ink: "#26221c", inkSoft: "#5b5143",
  red: "#a8262c", gold: "#c9a24a", green: "#2d5a3f", navy: "#1d2a45", white: "#fffdf7",
}

const font = (pkg, file) => fs.readFileSync(path.join(ROOT, "node_modules/@fontsource", pkg, "files", file))
const FONTS = [
  { name: "Display", data: font("dm-serif-display", "dm-serif-display-latin-400-normal.woff"), weight: 400, style: "normal" },
  { name: "Display", data: font("dm-serif-display", "dm-serif-display-latin-400-italic.woff"), weight: 400, style: "italic" },
  { name: "Oswald", data: font("oswald", "oswald-latin-500-normal.woff"), weight: 500, style: "normal" },
  { name: "Oswald", data: font("oswald", "oswald-latin-700-normal.woff"), weight: 700, style: "normal" },
  { name: "Literata", data: font("literata", "literata-latin-400-normal.woff"), weight: 400, style: "normal" },
  { name: "Literata", data: font("literata", "literata-latin-400-italic.woff"), weight: 400, style: "italic" },
  { name: "Literata", data: font("literata", "literata-latin-600-normal.woff"), weight: 600, style: "normal" },
]

// Mini "JSX" para o satori.
const h = (type, style = {}, ...children) => ({
  type,
  props: { style: { display: "flex", ...style }, children: children.flat().filter((c) => c !== null && c !== false && c !== undefined) },
})
const img = (src, style) => ({ type: "img", props: { src, style } })

const BRASAO = `data:image/png;base64,${fs.readFileSync(path.join(ROOT, "src/assets/brasao.png")).toString("base64")}`

async function photo(file, width, height) {
  const buf = await sharp(path.join(ASSETS, file)).rotate().resize(width, height, { fit: "cover", position: "attention" }).jpeg({ quality: 88 }).toBuffer()
  return `data:image/jpeg;base64,${buf.toString("base64")}`
}

// ---------- leitura do post ----------
function readPost(file) {
  const raw = fs.readFileSync(path.join(POSTS, file), "utf8")
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  const fm = parseYaml(m[1])
  const body = m[2].replace(/%%[\s\S]*?%%/g, "")
  const lead = (body.match(/> \[!ABSTRACT\][^\n]*\n((?:>.*\n?)+)/) || [])[1]
  let leadText = lead ? lead.split("\n").map((l) => l.replace(/^>\s?/, "")).join(" ").replace(/\s+/g, " ").trim() : ""
  // Espaços que não quebram linha ("R$ 80 mil" fica junto).
  leadText = leadText.replace(/R\$ /g, "R$\u00a0").replace(/(\d) (mil|milhões|km|cv|kg)\b/g, "$1\u00a0$2")
  const headings = [...body.matchAll(/^## (.+)$/gm)].map((x) => x[1].replace(/[*_"]/g, "").trim())
  const images = [...body.matchAll(/!\[\[([^\]|]+)(?:\|[^\]]*)?\]\]\s*\n\*([^\n]+)\*/g)].map((x) => ({ file: x[1].trim(), caption: x[2].trim() }))
  const coverFile = String(fm.image ?? "").replace(/^\[\[|\]\]$/g, "").trim() || null
  const tags = (fm.tags ?? []).filter((t) => t !== "post")
  const kind = tags.includes("pit-stop") ? "Pit Stop" : tags.includes("pensata") ? "Pensata" : "Dossiê"
  const firstSentence = (leadText.match(/^.+?[.!?](?=\s|$)/) || [""])[0]
  const subtitle = firstSentence.length && firstSentence.length <= 120 ? firstSentence : ""
  return { subtitle, file, fm, slug: fm.slug, title: fm.title, date: fm.date, hora: fm.hora, leadText, headings, images, coverFile, tags, kind, body }
}

function publishedPosts() {
  const all = fs.readdirSync(POSTS).filter((f) => f.endsWith(".md")).map(readPost)
    .filter((p) => (p.fm.tags ?? []).includes("post") && !/^(rascunho|draft)$/i.test(p.fm.status ?? ""))
  all.sort((a, b) => new Date(a.date) - new Date(b.date) || String(a.hora ?? "").localeCompare(String(b.hora ?? "")))
  all.forEach((p, i) => (p.number = String(i + 1).padStart(2, "0")))
  return all
}

// ---------- peças visuais ----------
const tricolor = (height = 14) =>
  h("div", { width: "100%", height }, h("div", { flex: 1, background: C.green }), h("div", { flex: 1, background: C.gold }), h("div", { flex: 1, background: C.red }))

const checker = (rows = 2, size = 22) =>
  h("div", { flexDirection: "column", width: "100%" },
    ...Array.from({ length: rows }, (_, r) =>
      h("div", { width: "100%" }, ...Array.from({ length: Math.ceil(W / size) }, (_, c) =>
        h("div", { width: size, height: size, background: (r + c) % 2 ? C.ink : C.paper })))))

const kicker = (text, color = C.red) =>
  h("div", { fontFamily: "Oswald", fontWeight: 700, fontSize: 30, letterSpacing: 6, color, textTransform: "uppercase" }, text)

const footer = (page, total, dark = false) =>
  h("div", { justifyContent: "space-between", alignItems: "center", width: W, boxSizing: "border-box", padding: "0 64px", height: 96, color: dark ? C.paper : C.inkSoft, fontFamily: "Oswald", fontWeight: 500, fontSize: 26, letterSpacing: 4 },
    h("div", { alignItems: "center", gap: 16 }, img(BRASAO, { width: 56, height: 56 }), "SCUDERIA 49"),
    h("div", {}, page === 1 ? "ARRASTA »" : `${page}/${total}`))

const titleSize = (t) => (t.length > 60 ? 64 : t.length > 40 ? 76 : 90)
const textSize = (t) => (t.length > 420 ? 42 : t.length > 300 ? 48 : t.length > 200 ? 54 : 60)

async function slideCover(p, total) {
  const cover = p.coverFile ? await photo(p.coverFile, W, 820) : null
  return h("div", { width: W, height: H, flexDirection: "column", background: C.paper },
    cover
      ? img(cover, { width: W, height: 820, objectFit: "cover" })
      : h("div", { width: W, height: 820, background: C.navy, flexDirection: "column", alignItems: "center" },
          h("div", { flex: 1, alignItems: "center", justifyContent: "center" }, img(BRASAO, { width: 420, height: 420 })),
          checker(2)),
    tricolor(16),
    h("div", { flexDirection: "column", flex: 1, padding: "40px 64px 0", gap: 18 },
      kicker(`${p.kind} Nº ${p.number}`),
      h("div", { fontFamily: "Display", fontSize: titleSize(p.title), lineHeight: 1.05, color: C.ink }, p.title),
      p.subtitle ? h("div", { fontFamily: "Literata", fontStyle: "italic", fontSize: 32, color: C.inkSoft, lineHeight: 1.3 }, p.subtitle) : null),
    footer(1, total))
}

async function slideLead(p, n, total) {
  return h("div", { width: W, height: H, flexDirection: "column", background: C.paper },
    tricolor(16),
    h("div", { flexDirection: "column", flex: 1, padding: "0 80px", gap: 30, justifyContent: "center" },
      kicker("O Lead"),
      h("div", { fontFamily: "Display", fontSize: 200, lineHeight: 0.6, color: C.red, height: 90 }, "“"),
      h("div", { fontFamily: "Literata", fontSize: textSize(p.leadText), lineHeight: 1.4, color: C.ink }, p.leadText)),
    checker(2),
    footer(n, total))
}

async function slideRoteiro(p, n, total) {
  const items = p.headings.slice(0, 7)
  return h("div", { width: W, height: H, flexDirection: "column", background: C.paper },
    tricolor(16),
    h("div", { flexDirection: "column", flex: 1, padding: "0 80px", gap: 26, justifyContent: "center" },
      kicker("Nesta edição"),
      ...items.map((t, i) =>
        h("div", { alignItems: "baseline", gap: 28, borderBottom: `2px solid ${C.paper2}`, paddingBottom: 18 },
          h("div", { fontFamily: "Oswald", fontWeight: 700, fontSize: 40, color: C.red, width: 70 }, String(i + 1).padStart(2, "0")),
          h("div", { fontFamily: "Display", fontSize: items.length > 5 ? 48 : 56, color: C.ink, flex: 1, lineHeight: 1.1 }, t)))),
    footer(n, total))
}

async function slidePhoto(p, image, n, total) {
  const src = await photo(image.file, 920, 1000)
  return h("div", { width: W, height: H, flexDirection: "column", background: C.paper2, alignItems: "center" },
    h("div", { flexDirection: "column", background: C.white, padding: "24px 24px 0", marginTop: 60, boxShadow: "0 18px 40px rgba(38,34,28,.25)" },
      img(src, { width: 920, height: 1000, objectFit: "cover" }),
      h("div", { fontFamily: "Literata", fontStyle: "italic", fontSize: 30, color: C.inkSoft, padding: "18px 6px 22px", width: 920, lineHeight: 1.3 }, image.caption)),
    h("div", { flex: 1 }),
    footer(n, total))
}

async function slideCTA(p, n, total) {
  return h("div", { width: W, height: H, flexDirection: "column", background: C.navy, color: C.paper },
    tricolor(16),
    h("div", { flexDirection: "column", flex: 1, alignItems: "center", justifyContent: "center", gap: 36, padding: "0 80px", textAlign: "center" },
      img(BRASAO, { width: 260, height: 260 }),
      kicker("Texto completo no site", C.gold),
      h("div", { fontFamily: "Display", fontSize: 76, lineHeight: 1.1, textAlign: "center" }, p.title),
      h("div", { fontFamily: "Oswald", fontWeight: 500, fontSize: 40, letterSpacing: 3, color: C.paper }, SITE),
      h("div", { fontFamily: "Literata", fontStyle: "italic", fontSize: 32, color: C.gold }, "link na bio")),
    checker(2),
    footer(n, total, true))
}

// ---------- legenda ----------
const TAG_HASH = {
  "cultura-automotiva": ["CulturaAutomotiva", "Gearhead"],
  "pit-stop": ["PitStop"],
  editorial: ["Dossie"],
  pensata: ["Pensata"],
}
function caption(p) {
  const hashes = new Set(["Scuderia49"])
  for (const t of p.tags) for (const x of TAG_HASH[t] ?? [t.replace(/-./g, (s) => s[1].toUpperCase()).replace(/^./, (s) => s.toUpperCase())]) hashes.add(x)
  hashes.add("HistoriaAutomotiva")
  return [
    `${p.kind} Nº ${p.number} · ${p.title}`,
    "",
    p.leadText,
    "",
    `📖 Texto completo no link da bio: ${SITE}/posts/${p.slug}/`,
    "",
    [...hashes].map((x) => `#${x}`).join(" "),
    "",
  ].join("\n")
}

// ---------- main ----------
async function render(node) {
  const svg = await satori(node, { width: W, height: H, fonts: FONTS })
  const png = new Resvg(svg, { fitTo: { mode: "width", value: W } }).render().asPng()
  return sharp(png).jpeg({ quality: 90, chromaSubsampling: "4:4:4" }).toBuffer()
}

async function buildKit(p, opts) {
  const fotos = opts.fotos ? opts.fotos.map((f) => p.images.find((i) => i.file === f) ?? { file: f, caption: "" }) : p.images.slice(0, 2)
  const plan = [slideCover, slideLead]
  if (p.headings.length >= 3) plan.push(slideRoteiro)
  const total = plan.length + fotos.length + 1
  const dir = path.join(OUT, p.slug)
  fs.mkdirSync(dir, { recursive: true })
  for (const f of fs.readdirSync(dir)) if (/^\d\d-.*\.jpg$/.test(f)) fs.unlinkSync(path.join(dir, f))
  let n = 0
  const save = async (name, node) => fs.writeFileSync(path.join(dir, `${String(++n).padStart(2, "0")}-${name}.jpg`), await render(node))
  await save("capa", await slideCover(p, total))
  await save("lead", await slideLead(p, 2, total))
  if (p.headings.length >= 3) await save("roteiro", await slideRoteiro(p, n + 1, total))
  for (const f of fotos) await save("foto", await slidePhoto(p, f, n + 1, total))
  await save("site", await slideCTA(p, n + 1, total))
  const leg = path.join(dir, "legenda.txt")
  if (!fs.existsSync(leg) || opts.refazerLegenda) fs.writeFileSync(leg, caption(p))
  console.log(`✔ ${p.slug}: ${n} imagens em ${path.relative(ROOT, dir)}`)
}

const args = process.argv.slice(2)
const opts = { refazerLegenda: args.includes("--refazer-legenda") }
const fi = args.indexOf("--fotos")
if (fi >= 0) opts.fotos = args[fi + 1].split(",").map((s) => s.trim())
const slugs = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--fotos")
const posts = publishedPosts()
const chosen = slugs.length ? posts.filter((p) => slugs.includes(p.slug)) : posts
if (!chosen.length) { console.error("Nenhum post encontrado para:", slugs.join(", ")); process.exit(1) }
for (const p of chosen) await buildKit(p, opts)
