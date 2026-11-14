#!/usr/bin/env bash
# Instala (ou atualiza) o timer do systemd que publica o cofre sozinho a cada 2 minutos.
# Desinstalar: systemctl --user disable --now scuderia49-publicar.timer
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
UNIT_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
NODE_BIN="$(dirname "$(command -v node)")"
mkdir -p "$UNIT_DIR"
chmod +x "$REPO/scripts/publicar-cofre.sh"

cat >"$UNIT_DIR/scuderia49-publicar.service" <<EOF
[Unit]
Description=Scuderia 49: publica no site o que mudou no cofre do Obsidian
After=network-online.target

[Service]
Type=oneshot
WorkingDirectory=$REPO
Environment=PATH=$NODE_BIN:/usr/local/bin:/usr/bin:/bin
Environment=ASTRO_TELEMETRY_DISABLED=1
ExecStart=$REPO/scripts/publicar-cofre.sh
Nice=10
EOF

cat >"$UNIT_DIR/scuderia49-publicar.timer" <<EOF
[Unit]
Description=Scuderia 49: confere o cofre a cada 2 minutos

[Timer]
OnBootSec=3min
OnUnitActiveSec=2min
Persistent=true

[Install]
WantedBy=timers.target
EOF

systemctl --user daemon-reload
systemctl --user enable --now scuderia49-publicar.timer
systemctl --user list-timers scuderia49-publicar.timer --no-pager
