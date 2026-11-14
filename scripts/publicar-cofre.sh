#!/usr/bin/env bash
# ------------------------------------------------------------------
# Scuderia 49: publica automaticamente o que mudou no cofre.
#
# Fluxo: Obsidian (tablet) → Syncthing → este PC → commit + push → GitHub Pages
#
# Só envia o que vai ao ar (posts publicados, imagens e a página Sobre).
# Ideias e rascunhos (00 - Caixa de Ideias, 10 - Box) nunca saem daqui,
# porque o repositório é público.
#
# Roda pelo timer do systemd (scripts/instalar-publicacao-automatica.sh).
# Manual: scripts/publicar-cofre.sh    Log: journalctl --user -u scuderia49-publicar
# ------------------------------------------------------------------
set -uo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO" || exit 1

BRANCH="v4"
PATHS=("content/20 - Linha de Montagem" "content/90 - Setup/Assets" "content/index.md")
# espera os arquivos ficarem parados por um tempo (o Syncthing pode estar no meio da cópia)
QUIET_SECONDS="${QUIET_SECONDS:-60}"

log() { echo "$*"; }
notify() {
  command -v notify-send >/dev/null 2>&1 && notify-send -a "Scuderia 49" -i dialog-information "$1" "${2:-}" 2>/dev/null || true
}
fail() {
  log "ERRO: $1"
  notify "⚠️ Scuderia 49: publicação travou" "$1"
  exit 1
}

# uma execução por vez
exec 9>"${XDG_RUNTIME_DIR:-/tmp}/scuderia49-publicar.lock"
flock -n 9 || exit 0

# não atrapalha se você estiver trabalhando em outra branch ou no meio de um rebase/merge
[ "$(git branch --show-current)" = "$BRANCH" ] || { log "Fora da branch $BRANCH; nada a fazer."; exit 0; }
GITDIR="$(git rev-parse --git-dir)"
if [ -d "$GITDIR/rebase-merge" ] || [ -d "$GITDIR/rebase-apply" ] || [ -f "$GITDIR/MERGE_HEAD" ]; then
  log "Git ocupado (rebase/merge em andamento); tento depois."
  exit 0
fi

titles=()
changed="$(git -c core.quotePath=false status --porcelain=v1 --untracked-files=all -- "${PATHS[@]}")"
ahead="$(git rev-list --count "origin/$BRANCH..$BRANCH" 2>/dev/null || echo 0)"

if [ -z "$changed" ] && [ "$ahead" = "0" ]; then
  exit 0
fi

if [ -n "$changed" ]; then
  # arquivos mexidos há pouco? espera a próxima rodada
  recent="$(find "${PATHS[@]}" -type f -newermt "-${QUIET_SECONDS} seconds" \
    -not -name '.syncthing.*' -not -name '~syncthing~*' 2>/dev/null | head -1)"
  if [ -n "$recent" ]; then
    log "Arquivos ainda chegando ($recent); tento na próxima rodada."
    exit 0
  fi

  # confere se o site ainda compila antes de mandar (evita derrubar o deploy)
  if command -v npm >/dev/null 2>&1; then
    if ! out="$(npm run --silent build 2>&1)"; then
      log "$out" | tail -20
      fail "O site não compilou com as mudanças do cofre. Veja: journalctl --user -u scuderia49-publicar"
    fi
  fi

  # mensagem de commit com os títulos dos posts
  while IFS= read -r line; do
    status="${line:0:2}"
    file="${line:3}"
    file="${file##* -> }" # renomeado: fica com o nome novo
    file="${file#\"}"; file="${file%\"}"
    [[ "$file" == *.md && "$file" == "content/20 - Linha de Montagem/"* && "$status" != " D" && "$status" != "D " ]] || continue
    [ -f "$file" ] || continue
    t="$(sed -n 's/^title:[[:space:]]*//p' "$file" | head -1 | sed 's/^["'\'']//; s/["'\'']$//')"
    titles+=("${t:-$(basename "$file" .md)}")
  done <<<"$changed"

  n_files="$(printf '%s\n' "$changed" | grep -c .)"
  if [ "${#titles[@]}" -eq 1 ]; then
    subject="post: ${titles[0]}"
  elif [ "${#titles[@]}" -gt 1 ]; then
    subject="post: ${#titles[@]} posts atualizados"
  else
    subject="conteudo: atualiza o cofre ($n_files arquivos)"
  fi
  body="Publicado automaticamente a partir do cofre do Obsidian."
  for t in "${titles[@]}"; do body+=$'\n'"- $t"; done

  git add -A -- "${PATHS[@]}" || fail "git add falhou"
  git commit -q -m "$subject" -m "$body" -- "${PATHS[@]}" || fail "git commit falhou"
  log "Commit: $subject"
fi

# traz o que houver de novo no GitHub e envia
if ! git pull -q --rebase --autostash origin "$BRANCH"; then
  git rebase --abort >/dev/null 2>&1
  fail "Conflito ao sincronizar com o GitHub. Resolva manualmente no PC."
fi
git push -q origin "$BRANCH" || fail "git push falhou (sem internet ou sem permissão?)"

log "Enviado para o GitHub."
if [ "${#titles[@]}" -gt 0 ]; then
  notify "🏁 Na pista!" "${titles[*]} — o site atualiza em cerca de 1 minuto."
else
  notify "🏁 Cofre enviado" "O site atualiza em cerca de 1 minuto."
fi
