#!/usr/bin/env node

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const targets = {
  cli: path.join(root, 'packages', 'cli'),
  macos: path.join(root, 'packages', 'macos'),
  windows: path.join(root, 'packages', 'windows'),
};
const selected = process.argv.length > 2 ? process.argv.slice(2) : Object.keys(targets);

for (const key of selected) {
  const destination = targets[key];
  if (!destination) throw new Error(`Unknown shared-file target: ${key}`);
  fs.copyFileSync(path.join(root, 'README.md'), path.join(destination, 'README.md'));
  fs.copyFileSync(path.join(root, 'LICENSE'), path.join(destination, 'LICENSE'));
  fs.rmSync(path.join(destination, 'README_CN.md'), {force: true});
  fs.rmSync(path.join(destination, 'README_zh.md'), {force: true});
  if (key === 'windows') {
    fs.copyFileSync(path.join(root, 'packages', 'macos', 'SKILL.md'), path.join(destination, 'SKILL.md'));
  }
}
