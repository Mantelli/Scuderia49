// @ts-check
import { defineConfig } from "astro/config"
import sitemap from "@astrojs/sitemap"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import { unified } from "@astrojs/markdown-remark"
import { remarkObsidian } from "./src/lib/remark-obsidian.mjs"

export default defineConfig({
  site: "https://scuderia49.com.br",
  trailingSlash: "ignore",
  integrations: [sitemap()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkObsidian, remarkMath],
      // MathML é renderizado nativamente pelo navegador: sem CSS nem fontes extras
      rehypePlugins: [[rehypeKatex, { output: "mathml" }]],
    }),
  },
  // Endereços do site antigo (Quartz) continuam funcionando
  redirects: {
    "/20---Linha-de-Montagem/2026-04-19-Boas-Vindas-S49": "/posts/boas-vindas",
    "/20---Linha-de-Montagem/2026-04-20-anatomia-de-um-fracasso-parte-1":
      "/posts/anatomia-de-um-fracasso-parte-1",
    "/20---Linha-de-Montagem/2026-04-25-A-Era-De-Ouro-Do-K7": "/posts/a-era-de-ouro-do-k7",
    "/20---Linha-de-Montagem/2026-08-02-O-Que-Aconteceu-Com-Os-Motorista":
      "/posts/o-que-aconteceu-com-os-motoristas",
    "/20---Linha-de-Montagem": "/dossies",
  },
})
