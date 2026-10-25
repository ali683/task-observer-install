#!/usr/bin/env bash
# Install task-observer for Claude Code on this machine. Idempotent.
# Usage: bash install.sh [workspace-root]   (default: $HOME)
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
ws="${1:-$HOME}"
case "$ws" in /*) ;; *) echo "workspace must be an absolute path" >&2; exit 2;; esac
claude="$HOME/.claude"
mkdir -p "$claude/skills/task-observer" "$claude/hooks"
cp -r "$here/skill/." "$claude/skills/task-observer/"
cp "$here/hooks/"* "$claude/hooks/"
chmod 755 "$claude/hooks/"*.sh
# Pin the workspace in the hook scripts and CLAUDE.md to this machine's path
for f in "$claude/hooks/"task-observer-*.{js,sh}; do sed -i.bak "s#/home/user#$ws#g" "$f" && rm -f "$f.bak"; done
sed -e "s#/home/user#$ws#g" -e "s#/root/.claude#$claude#g" "$here/settings.json" > "$claude/settings.json"
if ! grep -q "task-observer activation block" "$claude/CLAUDE.md" 2>/dev/null; then
  { [ -f "$claude/CLAUDE.md" ] && cat "$claude/CLAUDE.md" && echo; } > "$claude/CLAUDE.md.tmp" || true
  sed "s#/home/user#$ws#g" "$here/CLAUDE.md" >> "$claude/CLAUDE.md.tmp"
  mv "$claude/CLAUDE.md.tmp" "$claude/CLAUDE.md"
fi
mkdir -p "$ws/skill-observations/observation-log/archive"
[ -e "$ws/skill-observations/last-review-date.txt" ] || printf 'never\n' > "$ws/skill-observations/last-review-date.txt"
[ -e "$ws/skill-observations/cross-cutting-principles.md" ] || printf '# Cross-Cutting Principles\n\nPrinciples that apply to all skills. Read as a mandatory checklist during\nany skill creation or regeneration.\n\n---\n\n## Active Principles\n' > "$ws/skill-observations/cross-cutting-principles.md"
bash "$claude/skills/task-observer/scripts/session-start-scan.sh" "$ws" >/dev/null
echo "installed: skill, hooks, settings, CLAUDE.md; workspace $ws/skill-observations"
echo "verify: open a NEW Claude Code session with ordinary work; checkpoints.log should get a 'session-start scan' line."
