import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Scuderia 49",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "en-US",
    baseUrl: "scuderia49.com.br",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Schibsted Grotesk", // Moderna e técnica
        body: "Charter", // Serifada: fundamental para leitura longa (long-form)
        code: "Fira Code",
      },
      colors: {
        lightMode: {
          light: "#fafafa", // Fundo limpo (papel)
          lightgray: "#e5e5e5", // Bordas e divisórias
          gray: "#b8b8b8", // Texto secundário
          darkgray: "#2d2d2d", // Texto principal (leitura confortável)
          dark: "#1a1a1a", // Títulos
          secondary: "#c53030", // Vermelho Scuderia (Links e botões)
          tertiary: "#5a6e69", // Racing Green discreto para detalhes
          highlight: "rgba(197, 48, 48, 0.07)", // Destaque de seleção
          textHighlight: "#c5303033",
        },
        darkMode: {
          light: "#121212",         // Cinza asfalto profundo
          lightgray: "#2a2a2a",
          gray: "#646464",
          darkgray: "#d4d4d4",
          dark: "#ebebec",
          secondary: "#ff4d4d",     // Vermelho vibrante no escuro
          tertiary: "#84a59d",
          highlight: "rgba(255, 77, 77, 0.15)",
          textHighlight: "#c5303033",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
