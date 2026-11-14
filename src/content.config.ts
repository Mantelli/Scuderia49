import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

// Os posts continuam no vault do Obsidian, em content/20 - Linha de Montagem
const posts = defineCollection({
  loader: glob({
    pattern: "*.md",
    base: "./content/20 - Linha de Montagem",
    // slug do frontmatter, senão o nome do arquivo sem a data
    generateId: ({ entry, data }) => {
      const slug = typeof data.slug === "string" ? data.slug.trim() : ""
      if (slug) return slug.toLowerCase()
      return entry
        .replace(/\.md$/, "")
        .replace(/^\d{4}-\d{2}-\d{2}-/, "")
        .toLowerCase()
    },
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).nullish().transform((t) => t ?? []),
    status: z.string().nullish(),
    description: z.string().nullish(),
    // capa: "[[foto.jpg]]", "foto.jpg" ou caminho — procurada nas imagens do cofre
    image: z.string().nullish(),
    imageAlt: z.string().nullish(),
  }),
})

export const collections = { posts }
