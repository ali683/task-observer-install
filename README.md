# task-observer install

Run `bash install.sh [workspace-root]` on each machine (default workspace: $HOME).
It copies the skill to ~/.claude/skills/task-observer, the hooks to ~/.claude/hooks,
merges settings.json, and appends the activation block to ~/.claude/CLAUDE.md.
Then open a fresh Claude Code session with ordinary work to verify activation.
