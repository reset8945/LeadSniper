'use strict';

const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const path = require('node:path');

const dispatcher = path.resolve(__dirname, '..', 'bin', 'leadsniper.cjs');

function dispatch(platform, architecture, args = []) {
  return childProcess.spawnSync(process.execPath, [dispatcher, ...args], {
    encoding: 'utf8',
    env: {
      ...process.env,
      LEADSNIPER_CLI_TEST_PLATFORM: platform,
      LEADSNIPER_CLI_TEST_ARCH: architecture,
      LEADSNIPER_CLI_TEST_ONLY: '1',
    },
  });
}

const mac = dispatch('darwin', 'arm64', ['--agent', 'claude,codex']);
assert.equal(mac.status, 0, mac.stderr);
assert.deepEqual(JSON.parse(mac.stdout), {
  platform: 'darwin', architecture: 'arm64', packageName: 'leadsniper-mac',
  forwardedArguments: ['--agent', 'claude,codex'],
});

const windows = dispatch('win32', 'x64', ['--all', '--yes']);
assert.equal(windows.status, 0, windows.stderr);
assert.deepEqual(JSON.parse(windows.stdout), {
  platform: 'win32', architecture: 'x64', packageName: 'leadsniper-win',
  forwardedArguments: ['--all', '--yes'],
});

const unsupported = dispatch('linux', 'x64');
assert.equal(unsupported.status, 1);
assert.match(unsupported.stderr, /supports only macOS Apple Silicon and Windows x64/);

console.log('Cross-platform dispatcher smoke test passed.');
