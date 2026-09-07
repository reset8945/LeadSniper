'use strict';

const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const packageRoot = path.resolve(__dirname, '..');
const testRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'leadsniper-win-installer-'));
const installHome = path.join(testRoot, 'home');
const localAppData = path.join(testRoot, 'local-app-data');
const destination = path.join(installHome, '.agents', 'skills', 'leadsniper');
const digest = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

try {
  fs.mkdirSync(path.join(installHome, '.codex'), {recursive: true});
  fs.mkdirSync(path.join(destination, 'scripts'), {recursive: true});
  fs.writeFileSync(path.join(destination, '.env'), 'KEEP_ME=1\n');
  fs.writeFileSync(path.join(destination, 'scripts', 'LeadSniper.exe'), 'old runtime\n');

  const result = childProcess.spawnSync(process.execPath, [path.join(packageRoot, 'bin', 'leadsniper-win.cjs'), '--agent', 'codex', '--yes'], {
    encoding: 'utf8',
    env: {
      ...process.env,
      LEADSNIPER_INSTALL_TEST_PLATFORM: 'win32',
      LEADSNIPER_INSTALL_TEST_ARCH: 'x64',
      LEADSNIPER_INSTALL_HOME: installHome,
      LEADSNIPER_INSTALL_LOCALAPPDATA: localAppData,
    },
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(fs.readFileSync(path.join(destination, '.env'), 'utf8'), 'KEEP_ME=1\n');
  assert.equal(digest(path.join(destination, 'scripts', 'LeadSniper.exe')), digest(path.join(packageRoot, 'LeadSniper.exe')));
  assert.equal(digest(path.join(destination, 'scripts', 'start_chrome_debug.bat')), digest(path.join(packageRoot, 'start_chrome_debug.bat')));
  console.log('Windows npm installer smoke test passed.');
} finally {
  fs.rmSync(testRoot, {recursive: true, force: true});
}
