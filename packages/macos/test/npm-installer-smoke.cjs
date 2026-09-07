'use strict';

const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const packageRoot = path.resolve(__dirname, '..');
const testRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'leadsniper-mac-installer-'));
const installHome = path.join(testRoot, 'home');
const destination = path.join(installHome, '.agents', 'skills', 'leadsniper');
const digest = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

try {
  fs.mkdirSync(path.join(installHome, '.codex'), {recursive: true});
  fs.mkdirSync(path.join(destination, 'scripts'), {recursive: true});
  fs.writeFileSync(path.join(destination, '.env'), 'KEEP_ME=1\n');
  fs.writeFileSync(path.join(destination, 'scripts', 'LeadSniper'), 'old runtime\n');

  const result = childProcess.spawnSync('bash', [path.join(packageRoot, 'bin', 'leadsniper-mac'), '--agent', 'codex', '--yes'], {
    encoding: 'utf8',
    env: {...process.env, LEADSNIPER_INSTALL_TEST_PLATFORM: 'Darwin', LEADSNIPER_INSTALL_TEST_ARCH: 'arm64', LEADSNIPER_INSTALL_HOME: installHome},
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(fs.readFileSync(path.join(destination, '.env'), 'utf8'), 'KEEP_ME=1\n');
  assert.equal(digest(path.join(destination, 'scripts', 'LeadSniper')), digest(path.join(packageRoot, 'LeadSniper')));
  assert.equal(digest(path.join(destination, 'scripts', 'start_chrome_debug.sh')), digest(path.join(packageRoot, 'start_chrome_debug.sh')));
  assert.equal(fs.statSync(path.join(destination, 'scripts', 'LeadSniper')).mode & 0o111, 0o111);
  console.log('macOS npm installer smoke test passed.');
} finally {
  fs.rmSync(testRoot, {recursive: true, force: true});
}
