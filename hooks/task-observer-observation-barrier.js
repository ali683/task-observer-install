// PreToolUse hook (matcher "Write"): refuse an editing-tool write that would
// CREATE a Markdown file in the observation log. The helper's noclobber create
// makes the path exist before the body is written, so its own write passes.
const fs = require('node:fs'), path = require('node:path');
let log;
try { log = fs.realpathSync(path.join('/home/user', 'skill-observations', 'observation-log')); } catch { process.exit(0); }
let input = {};
try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { process.exit(0); }
const p = input.tool_input && input.tool_input.file_path;
if (typeof p !== 'string' || !p.endsWith('.md') || fs.existsSync(p)) process.exit(0);
let dir;
try { dir = fs.realpathSync(path.dirname(path.resolve(p))); } catch { process.exit(0); }
if (dir !== log && dir !== path.join(log, 'archive')) process.exit(0);
process.stderr.write('task-observer: observation files are created only by scripts/new-observation.sh, ' +
  'which derives the id and refuses a collision. Run it, then write the body into the path it prints.\n');
process.exit(2);
