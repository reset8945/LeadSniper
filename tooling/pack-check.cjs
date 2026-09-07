#!/usr/bin/env node

'use strict';

const childProcess = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const packages = [
  {
    workspace: 'packages/cli',
    required: ['bin/leadsniper.cjs', 'LICENSE', 'README.md'],
    forbidden: ['README_CN.md', 'README_zh.md', 'LeadSniper', 'LeadSniper.exe'],
  },
  {
    workspace: 'packages/macos',
    required: ['bin/leadsniper-mac', 'LeadSniper', 'start_chrome_debug.sh', 'SKILL.md', 'LICENSE', 'README.md'],
    forbidden: ['README_CN.md', 'README_zh.md', 'LeadSniper.exe', 'start_chrome_debug.bat'],
  },
  {
    workspace: 'packages/windows',
    required: ['bin/leadsniper-win.cjs', 'LeadSniper.exe', 'start_chrome_debug.bat', 'SKILL.md', 'LICENSE', 'README.md'],
    forbidden: ['README_CN.md', 'README_zh.md', 'LeadSniper', 'start_chrome_debug.sh'],
  },
];

for (const entry of packages) {
  const result = childProcess.spawnSync(npm, [
    'pack', '--dry-run', '--json', '--workspace', entry.workspace,
    '--cache', path.join(root, '.npm-cache'),
  ], {cwd: root, encoding: 'utf8'});
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }
  const report = JSON.parse(result.stdout)[0];
  const files = new Set(report.files.map((file) => file.path));
  for (const required of entry.required) {
    if (!files.has(required)) throw new Error(`${report.name} is missing release file: ${required}`);
  }
  for (const forbidden of entry.forbidden) {
    if (files.has(forbidden)) throw new Error(`${report.name} contains forbidden file: ${forbidden}`);
  }
  console.log(`${report.name}@${report.version}: ${report.entryCount} files, ${(report.size / 1024 / 1024).toFixed(1)} MB`);
}

console.log('All npm package manifests and platform file boundaries are valid.');
