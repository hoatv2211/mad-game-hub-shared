const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const waitMs = parseInt(process.argv[2] || '12000', 10);
const startIdx = parseInt(process.argv[3] || '0', 10);
const endIdx   = parseInt(process.argv[4] || '999', 10);

const projectRoot = path.resolve(__dirname, '..', '..');
const hubJson = path.join(projectRoot, 'docs', 'data', 'hub-games.json');
const data = JSON.parse(fs.readFileSync(hubJson, 'utf8').replace(/^﻿/, ''));
const games = data.games || [];
console.log(`[batch] found ${games.length} games, waitMs=${waitMs}, range=[${startIdx}, ${endIdx}]`);

let ok = 0, fail = 0, skipped = 0;
for (let i = 0; i < games.length; i++) {
  const g = games[i];
  if (i < startIdx) { skipped++; continue; }
  if (i > endIdx) break;
  const out = path.join(projectRoot, 'docs', 'assets', 'game-icons', `${g.folder}.png`);
  process.stdout.write(`[${i + 1}/${games.length}] ${g.folder} ... `);
  const r = spawnSync(
    process.execPath,
    [path.join(__dirname, 'generate-icon.js'), g.playPath, out, String(waitMs)],
    { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' }
  );
  if (r.status === 0) {
    ok++;
    console.log('ok');
  } else {
    fail++;
    const last = (r.stderr || r.stdout || '').split('\n').filter(Boolean).slice(-2).join(' | ');
    console.log(`FAIL: ${last}`);
  }
}
console.log(`\n[batch] done. ok=${ok} fail=${fail} skipped=${skipped}`);
process.exit(fail > 0 ? 1 : 0);
