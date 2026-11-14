import { getCollection, type CollectionEntry } from "astro:content"

export type Post = CollectionEntry<"posts">

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
  const body = post.body ?? ""
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
