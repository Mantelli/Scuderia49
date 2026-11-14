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
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      status: z.string().optional(),
      description: z.string().optional(),
      // aceita vazio (""), caminho relativo ao post ou URL
      image: z
        .union([image(), z.string()])
        .optional()
        .transform((v) => (v === "" ? undefined : v)),
      imageAlt: z.string().optional(),
    }),
})

export const collections = { posts }
