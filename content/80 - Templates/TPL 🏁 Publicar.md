<%*
const f = tp.config.target_file;
if (!f.path.startsWith("10 - Box/")) {
  new Notice("🏁 Abra um rascunho da pasta 10 - Box antes de publicar.");
  return;
}
const slugify = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60).replace(/-+$/, "");
const fm = app.metadataCache.getFileCache(f)?.frontmatter ?? {};
const corpo = (await app.vault.read(f)).replace(/^---[\s\S]*?\n---/, "").replace(/%%[\s\S]*?%%/g, "");
const palavras = corpo.split(/\s+/).filter(Boolean).length;
const pitStop = [].concat(fm.tags ?? []).includes("pit-stop");

// Checklist de pré-largada
const problemas = [];
if (!fm.title) problemas.push("sem título");
if (palavras < (pitStop ? 120 : 400)) problemas.push(`texto curto (${palavras} palavras)`);
if (/^##\s*Título que conta a história/m.test(corpo)) problemas.push("sobrou o subtítulo de exemplo");
if (/\[!ABSTRACT\][^\n]*\n>\s*(\n|$)/.test(corpo)) problemas.push("O Lead está vazio");
if (fm.image && !fm.imageAlt) problemas.push("capa sem descrição (imageAlt)");
if (problemas.length) {
  const seguir = await tp.system.suggester(
    ["✋ Voltar e ajustar", "🏁 Publicar mesmo assim"], [false, true], false,
    "Checklist: " + problemas.join(" · "));
  if (!seguir) return;
}

const hoje = tp.date.now("YYYY-MM-DD");
const slug = fm.slug || slugify(fm.title || f.basename);
await app.fileManager.processFrontMatter(f, (m) => {
  const tags = Array.isArray(m.tags) ? m.tags : m.tags ? [m.tags] : [];
  m.tags = [...new Set([...tags, "post"])];
  m.slug = slug;
  m.date = hoje;
  m.status = "Postado";
});
await tp.file.move(`20 - Linha de Montagem/${hoje}-${slug}`, f);
new Notice(`🏁 Na Linha de Montagem! Vai ao ar em /posts/${slug} em uns 3 minutos (o PC precisa estar ligado).`, 8000);
-%>
