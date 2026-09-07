#!/usr/bin/env node

'use strict';

const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const platform = process.env.LEADSNIPER_CLI_TEST_PLATFORM || process.platform;
const architecture = process.env.LEADSNIPER_CLI_TEST_ARCH || process.arch;

const TARGETS = {
  'darwin-arm64': {packageName: 'leadsniper-mac', binName: 'leadsniper-mac'},
  'win32-x64': {packageName: 'leadsniper-win', binName: 'leadsniper-win'},
};

function fail(message) {
  console.error(`Error: ${message}`);
  process.exitCode = 1;
}

function resolveTarget() {
  const target = TARGETS[`${platform}-${architecture}`];
  if (target) return target;
  fail(`LeadSniper supports only macOS Apple Silicon and Windows x64; current platform is ${platform} ${architecture}.`);
  return null;
}

function resolveExecutable(target) {
  let packageJsonPath;
  try {
    packageJsonPath = require.resolve(`${target.packageName}/package.json`);
  } catch {
    fail(`The platform package ${target.packageName} is missing. Re-run npx --yes leadsniper@latest without --omit=optional.`);
    return null;
  }

  const manifest = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const relativeBin = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin?.[target.binName];
  if (!relativeBin) {
    fail(`${target.packageName} does not define the ${target.binName} command.`);
    return null;
  }
  const executable = path.resolve(path.dirname(packageJsonPath), relativeBin);
  if (!fs.statSync(executable, {throwIfNoEntry: false})?.isFile()) {
    fail(`${target.packageName} is incomplete; missing ${relativeBin}.`);
    return null;
  }
  return executable;
}

function main() {
  const target = resolveTarget();
  if (!target) return;

  if (process.env.LEADSNIPER_CLI_TEST_ONLY === '1') {
    console.log(JSON.stringify({
      platform,
      architecture,
      packageName: target.packageName,
      forwardedArguments: process.argv.slice(2),
    }));
    return;
  }

  const executable = resolveExecutable(target);
  if (!executable) return;
  const windows = platform === 'win32';
  const command = windows ? process.execPath : executable;
  const args = windows ? [executable, ...process.argv.slice(2)] : process.argv.slice(2);
  const result = childProcess.spawnSync(command, args, {stdio: 'inherit', windowsHide: true});
  if (result.error) return fail(`Could not start ${target.packageName}: ${result.error.message}`);
  if (result.signal) return fail(`${target.packageName} was terminated by signal ${result.signal}.`);
  process.exitCode = result.status ?? 1;
}

main();
