// Skill-file write gate: deny a write to a skill file until the skill-authoring
// reference has been read in this session. One script, two hook entries:
// PreToolUse on Write|Edit|MultiEdit, PostToolUse on Read.
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
let input = {};
try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { process.exit(0); }
const session = String(input.session_id || '').replace(/[^A-Za-z0-9_-]/g, '');
const file = String((input.tool_input || {}).file_path || '').replace(/\\/g, '/');
if (!session || !file) process.exit(0);
const marker = path.join(os.tmpdir(), `task-observer-authoring-${session}`);
if (input.hook_event_name === 'PostToolUse') {
  if (/\/references\/skill-authoring\.md$/.test(file)) fs.writeFileSync(marker, file);
  process.exit(0);
}
const skillFile = /(^|\/)SKILL\.md$/.test(file) || /\/skills\/[^/]+\//.test(file)
  || /\/skill-updates\/[^/]+\/[^/]+\//.test(file);
if (!skillFile || fs.existsSync(marker)) process.exit(0);
console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny',
  permissionDecisionReason: 'Read references/skill-authoring.md (task-observer skill) in this session ' +
    'before writing a skill file; this write is allowed once that Read has run.' } }));
