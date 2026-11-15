import { getCollection, type CollectionEntry } from "astro:content"
import type { ImageMetadata } from "astro"

export type Post = CollectionEntry<"posts">

// Todas as imagens do cofre, indexadas pelo nome do arquivo (como o Obsidian faz)
const vaultImages = import.meta.glob<{ default: ImageMetadata }>(
  "/content/**/*.{png,jpg,jpeg,webp,avif,gif,PNG,JPG,JPEG,WEBP}",
  { eager: true },
)
const imagesByName = new Map(
  Object.entries(vaultImages).map(([p, mod]) => [p.split("/").pop()!.toLowerCase(), mod.default]),
)

/** Capa do post a partir do campo `image` ("[[foto.jpg]]", "foto.jpg" ou caminho). */
export function cover(post: Post): ImageMetadata | undefined {
  const raw = post.data.image?.trim()
  if (!raw) return undefined
  const name = raw
    .replace(/^!?\[\[|\]\]$/g, "")
    .split("|")[0]
    .split("/")
    .pop()!
    .trim()
    .toLowerCase()
  return imagesByName.get(name)
}

/** Formato do post: "pit-stop" (nota rápida), "pensata" (crônica de opinião) ou dossiê. */
export const isPitStop = (post: Post) => post.data.tags.includes("pit-stop")
export const isPensata = (post: Post) => post.data.tags.includes("pensata")
export const formatName = (post: Post) => (isPitStop(post) ? "Pit Stop" : isPensata(post) ? "Pensata" : "Dossiê")
export const kicker = (post: Post, number: string) => `${formatName(post)} Nº ${number}`

const DRAFT = /^(rascunho|draft)$/i

/** Posts publicados (tag "post" e status diferente de rascunho), do mais novo ao mais antigo. */
export async function getPosts(): Promise<Post[]> {
  const all = await getCollection(
    "posts",
    (p) => p.data.tags.includes("post") && !DRAFT.test(p.data.status ?? ""),
  )
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

/** Número do dossiê: ordem cronológica de publicação (o primeiro post é o Nº 01). */
export function dossieNumber(post: Post, posts: Post[]): string {
  const n = posts.length - posts.findIndex((p) => p.id === post.id)
  return String(n).padStart(2, "0")
}

/** Texto do callout "[!ABSTRACT]" (o Lead), usado como resumo e meta description. */
export function lead(post: Post): string {
  if (post.data.description) return post.data.description
  const body = (post.body ?? "").replace(/%%[\s\S]*?%%/g, "")
  const m = body.match(/^>\s*\[!(?:abstract|summary)\][^\n]*\n((?:>[^\n]*\n?)+)/im)
  const text = m
    ? m[1].replace(/^>\s?/gm, " ")
    : (body.split(/\n\s*\n/).find((p) => /^[A-Za-zÀ-ú]/.test(p.trim())) ?? "")
  return text
    .replace(/[*_`#>]|\[\[|\]\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export function readingTime(post: Post): number {
  const words = (post.body ?? "").split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

const fmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })
export const formatDate = (d: Date) => fmt.format(d).replace(/\./g, "").replace(/ de /g, " ")

/** Tags editoriais (a tag técnica "post" fica de fora). */
export const visibleTags = (post: Post) => post.data.tags.filter((t) => t !== "post")

export const tagLabel = (t: string) => t.replace(/-/g, " ")
