import rss from "@astrojs/rss"
import type { APIContext } from "astro"
import { getPosts, lead } from "../lib/posts"

export async function GET(context: APIContext) {
  const posts = await getPosts()
  return rss({
    title: "Scuderia 49",
    description: "A Garagem Onde as Máquinas Têm Alma",
    site: context.site!,
    customData: "<language>pt-br</language>",
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: lead(p),
      link: `/posts/${p.id}`,
      categories: p.data.tags.filter((t) => t !== "post"),
    })),
  })
}
