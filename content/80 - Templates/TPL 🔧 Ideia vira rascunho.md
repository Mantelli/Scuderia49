<%*
const f = tp.config.target_file;
if (!f.path.startsWith("00 - Caixa de Ideias/")) {
  new Notice("🔧 Abra uma nota da Caixa de Ideias antes de rodar este comando.");
  return;
}
const slugify = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60).replace(/-+$/, "");
const titulo = (await tp.system.prompt("Título do post", f.basename)) || f.basename;
const formato = (await tp.system.suggester(
  ["🏎️ Dossiê: texto longo, com história e pesquisa", "⛽ Pit Stop: nota rápida, 200 a 400 palavras"],
  ["dossie", "pit-stop"], false, "Qual o formato?")) ?? "dossie";
const slug = slugify(titulo);
const hoje = tp.date.now("YYYY-MM-DD");
await app.fileManager.processFrontMatter(f, (fm) => {
  for (const k of Object.keys(fm)) delete fm[k];
  fm.title = titulo;
  fm.slug = slug;
  fm.date = hoje;
  fm.tags = [formato === "pit-stop" ? "pit-stop" : "editorial", "cultura-automotiva"];
  fm.status = "rascunho";
  fm.image = null;
  fm.imageAlt = null;
});
await tp.file.move(`10 - Box/${hoje}-${slug}`, f);
new Notice("🔧 A ideia foi pro Box. Bora escrever!");
-%>
