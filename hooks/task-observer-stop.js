// Stop hook: the per-task backstop as a harness event instead of prose.
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const MIN_TOOL_USES = 3; // below this the turn is conversation, not work
const base = path.join('/home/user', 'skill-observations'); // the pinned workspace
const block = (reason) => { fs.writeFileSync(marker, new Date().toISOString()); console.log(JSON.stringify({ decision: 'block', reason })); process.exit(0); };

let input = {};
try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { process.exit(0); }
if (input.stop_hook_active) process.exit(0);
const session = String(input.session_id || '').replace(/[^A-Za-z0-9_-]/g, '');
const transcript = input.transcript_path;
if (!session || !transcript) process.exit(0);

const marker = path.join(os.tmpdir(), `task-observer-backstop-${session}`);
if (fs.existsSync(marker)) process.exit(0);

let started = 0, toolUses;
try {
  const st = fs.statSync(transcript), text = fs.readFileSync(transcript, 'utf8');
  toolUses = (text.match(/"type":\s*"tool_use"/g) || []).length;
  if (st.birthtimeMs > 0 && st.birthtimeMs < st.ctimeMs) started = st.birthtimeMs;
  else { const m = text.match(/"timestamp":\s*"([^"]+)"/); if (m) started = Date.parse(m[1]) || 0; }
} catch { process.exit(0); }
if (toolUses < MIN_TOOL_USES) process.exit(0);

if (!(started > 0)) block('task-observer backstop: cannot tell when this session started (no birth time, no ' +
  'transcript timestamp), so it cannot check the log. Check by hand that this session wrote an observation ' +
  'or a checkpoints.log line, and report the one-line summary. Fires once per session.');

const files = [path.join(base, 'checkpoints.log')];
try {
  for (const n of fs.readdirSync(path.join(base, 'observation-log')))
    if (n.endsWith('.md')) files.push(path.join(base, 'observation-log', n));
} catch { process.exit(0); }
const touched = files.some((f) => { try { return fs.statSync(f).mtimeMs > started; } catch { return false; } });
if (touched) process.exit(0);

block('task-observer backstop: this session used tools but wrote no observation file and no checkpoint line. ' +
  'If the skill was never invoked, invoke it now; then write pending observations or append a ' +
  '"no observations" line to checkpoints.log, and report the one-line summary. Fires once per session.');
