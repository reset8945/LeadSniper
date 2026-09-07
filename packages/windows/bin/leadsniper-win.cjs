#!/usr/bin/env node

'use strict';

const childProcess = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const readline = require('node:readline');

const SKILL_NAME = 'leadsniper';
const PACKAGE_ROOT = path.resolve(__dirname, '..');
const PLATFORM = process.env.LEADSNIPER_INSTALL_TEST_PLATFORM || process.platform;
const ARCHITECTURE = process.env.LEADSNIPER_INSTALL_TEST_ARCH || process.arch;
const INSTALL_HOME = process.env.LEADSNIPER_INSTALL_HOME || os.homedir();
const LOCAL_APP_DATA = process.env.LEADSNIPER_INSTALL_LOCALAPPDATA || process.env.LOCALAPPDATA || path.join(INSTALL_HOME, 'AppData', 'Local');

const SOURCE_FILES = [
  ['SKILL.md', 'SKILL.md'],
  ['README.md', 'README.md'],
  ['LeadSniper.exe', path.join('scripts', 'LeadSniper.exe')],
  ['start_chrome_debug.bat', path.join('scripts', 'start_chrome_debug.bat')],
];
const CANONICAL_FILES = SOURCE_FILES.map(([, destination]) => destination);

function hermesHome() {
  return process.env.HERMES_HOME || path.join(LOCAL_APP_DATA, 'hermes');
}

const AGENTS = {
  hermes: {
    label: 'Hermes Agent', command: 'hermes',
    detectPaths: () => [hermesHome(), path.join(LOCAL_APP_DATA, 'Programs', 'Hermes')],
    destination: () => path.join(hermesHome(), 'skills', SKILL_NAME),
  },
  openclaw: {
    label: 'OpenClaw', command: 'openclaw',
    detectPaths: () => [path.join(INSTALL_HOME, '.openclaw')],
    destination: () => path.join(INSTALL_HOME, '.openclaw', 'skills', SKILL_NAME),
  },
  claude: {
    label: 'Claude Code', command: 'claude',
    detectPaths: () => [path.join(INSTALL_HOME, '.claude')],
    destination: () => path.join(INSTALL_HOME, '.claude', 'skills', SKILL_NAME),
  },
  codex: {
    label: 'Codex', command: 'codex',
    detectPaths: () => [path.join(INSTALL_HOME, '.codex'), path.join(LOCAL_APP_DATA, 'Programs', 'Codex')],
    destination: () => path.join(INSTALL_HOME, '.agents', 'skills', SKILL_NAME),
  },
};
const AGENT_ORDER = ['hermes', 'openclaw', 'claude', 'codex'];

function usage() {
  console.log(`LeadSniper Windows Skill installer

Usage:
  npx --yes leadsniper@latest
  npx --yes leadsniper@latest --agent hermes,codex
  npx --yes leadsniper@latest --all --yes

Platform package:
  npx --yes leadsniper-win@latest

Options:
  --agent <names>  Install into comma-separated Agents
                    Supports hermes, openclaw, claude, and codex
  --all            Install into every detected Agent
  --yes, -y        Update existing installations without prompting
  --dry-run        Show operations without writing files
  --list           Show detected Agents and installation paths
  --help, -h       Show help`);
}

function parseArgs(argv) {
  const options = {requestedAgents: '', all: false, yes: false, dryRun: false, list: false, help: false};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--agent') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error('--agent requires a value.');
      options.requestedAgents = value;
      index += 1;
    } else if (argument.startsWith('--agent=')) options.requestedAgents = argument.slice('--agent='.length);
    else if (argument === '--all') options.all = true;
    else if (argument === '--yes' || argument === '-y') options.yes = true;
    else if (argument === '--dry-run') options.dryRun = true;
    else if (argument === '--list') options.list = true;
    else if (argument === '--help' || argument === '-h') options.help = true;
    else throw new Error(`Unknown option: ${argument}`);
  }
  if (options.requestedAgents && options.all) throw new Error('--agent and --all cannot be used together.');
  return options;
}

function commandExists(command) {
  try {
    return childProcess.spawnSync('where.exe', [command], {stdio: 'ignore', windowsHide: true}).status === 0;
  } catch {
    return false;
  }
}

function agentDetected(key) {
  const agent = AGENTS[key];
  return commandExists(agent.command) || agent.detectPaths().some((entry) => fs.existsSync(entry));
}

function printDetection() {
  console.log('Supported LeadSniper Agents:');
  for (const key of AGENT_ORDER) {
    const detected = agentDetected(key);
    console.log(`  [${detected ? 'detected' : 'not detected'}] ${AGENTS[key].label}${detected ? `  ${AGENTS[key].destination()}` : ''}`);
  }
}

function normalizeAgent(value) {
  return {
    hermes: 'hermes', 'hermes-agent': 'hermes', openclaw: 'openclaw', 'open-claw': 'openclaw',
    claude: 'claude', 'claude-code': 'claude', claudecode: 'claude', codex: 'codex', 'openai-codex': 'codex',
  }[value.trim().toLowerCase()] || null;
}

function parseRequestedAgents(raw) {
  const selected = [];
  for (const item of raw.replaceAll('，', ',').split(',')) {
    if (!item.trim()) continue;
    const key = normalizeAgent(item);
    if (!key) throw new Error(`Unsupported Agent: ${item.trim()}`);
    if (!selected.includes(key)) selected.push(key);
  }
  return selected;
}

function ask(question) {
  const terminal = readline.createInterface({input: process.stdin, output: process.stdout});
  return new Promise((resolve) => terminal.question(question, (answer) => { terminal.close(); resolve(answer.trim()); }));
}

async function selectInteractively(detected) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error('Use --agent or --all in a non-interactive terminal.');
  console.log('\nSelect one or more installation targets (for example 1,3):');
  detected.forEach((key, index) => console.log(`  ${index + 1}) ${AGENTS[key].label}`));
  console.log('  a) All\n  q) Quit');
  const answer = (await ask('Selection: ')).replaceAll('，', ',').replaceAll(/\s/g, '');
  if (/^q$/i.test(answer)) return [];
  if (/^a$/i.test(answer)) return [...detected];
  const selected = [];
  for (const value of answer.split(',')) {
    if (!/^\d+$/.test(value)) throw new Error(`Invalid selection: ${value}`);
    const index = Number(value) - 1;
    if (index < 0 || index >= detected.length) throw new Error(`Invalid selection: ${value}`);
    if (!selected.includes(detected[index])) selected.push(detected[index]);
  }
  return selected;
}

function verifyPackage() {
  for (const [sourceRelative] of SOURCE_FILES) {
    if (!fs.statSync(path.join(PACKAGE_ROOT, sourceRelative), {throwIfNoEntry: false})?.isFile()) {
      throw new Error(`The npm package is incomplete; missing ${sourceRelative}.`);
    }
  }
}

function installationExists(destination) {
  return CANONICAL_FILES.some((relative) => fs.existsSync(path.join(destination, relative)));
}

function timestamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}-${process.pid}`;
}

function backupExistingFiles(key, destination) {
  const backupRoot = path.join(LOCAL_APP_DATA, 'LeadSniperInstaller', 'backups', key, timestamp());
  let copied = 0;
  for (const relative of CANONICAL_FILES) {
    const source = path.join(destination, relative);
    if (!fs.existsSync(source)) continue;
    const target = path.join(backupRoot, relative);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.copyFileSync(source, target);
    copied += 1;
  }
  if (copied > 0) console.log(`  Previous published files backed up to: ${backupRoot}`);
}

function atomicCopy(source, destination) {
  fs.mkdirSync(path.dirname(destination), {recursive: true});
  const temporary = `${destination}.leadsniper-new-${process.pid}`;
  const previous = `${destination}.leadsniper-old-${process.pid}`;
  fs.copyFileSync(source, temporary);
  let movedPrevious = false;
  try {
    if (fs.existsSync(destination)) {
      fs.renameSync(destination, previous);
      movedPrevious = true;
    }
    fs.renameSync(temporary, destination);
    if (movedPrevious) fs.rmSync(previous, {force: true});
  } catch (error) {
    fs.rmSync(temporary, {force: true});
    if (movedPrevious && !fs.existsSync(destination) && fs.existsSync(previous)) fs.renameSync(previous, destination);
    if (error && ['EBUSY', 'EPERM', 'EACCES'].includes(error.code)) {
      throw new Error(`Could not update ${destination}; close LeadSniper and the Agent, then retry.`);
    }
    throw error;
  }
}

async function installAgent(key, options) {
  const agent = AGENTS[key];
  const destination = agent.destination();
  console.log(`\nInstalling into ${agent.label}: ${destination}`);
  if (installationExists(destination) && !options.yes && !options.dryRun) {
    if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error('Installation exists; add --yes for a non-interactive update.');
    if (!/^y$/i.test(await ask('  LeadSniper exists. Back up and update it? [y/N] '))) {
      console.log('  Skipped.');
      return;
    }
  }
  if (options.dryRun) {
    console.log('  [dry-run] Published files would be updated; configuration and user data would be preserved.');
    return;
  }
  if (installationExists(destination)) backupExistingFiles(key, destination);
  for (const [sourceRelative, destinationRelative] of SOURCE_FILES) {
    atomicCopy(path.join(PACKAGE_ROOT, sourceRelative), path.join(destination, destinationRelative));
  }
  for (const executable of ['LeadSniper.exe', 'start_chrome_debug.bat']) {
    if (!fs.statSync(path.join(destination, 'scripts', executable), {throwIfNoEntry: false})?.isFile()) {
      throw new Error(`Executable verification failed: ${executable}`);
    }
  }
  console.log('  Installation complete. Configuration, browser profiles, databases, and output data were preserved.');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) return usage();
  verifyPackage();
  if (PLATFORM !== 'win32' || ARCHITECTURE !== 'x64') throw new Error(`leadsniper-win supports only Windows x64; current platform is ${PLATFORM} ${ARCHITECTURE}.`);
  const detected = AGENT_ORDER.filter(agentDetected);
  if (options.list) return printDetection();
  let selected;
  if (options.requestedAgents) {
    selected = parseRequestedAgents(options.requestedAgents);
    for (const key of selected) if (!agentDetected(key)) console.error(`Warning: ${AGENTS[key].label} was not detected; continuing because it was explicitly requested.`);
  } else if (options.all) selected = [...detected];
  else {
    printDetection();
    if (detected.length === 0) throw new Error('No supported Agent was detected. Use --agent to select one explicitly.');
    selected = await selectInteractively(detected);
  }
  if (selected.length === 0) {
    if (!options.requestedAgents && !options.all) return console.log('Cancelled.');
    throw new Error('No installation target selected.');
  }
  for (const key of selected) await installAgent(key, options);
  console.log(options.dryRun ? '\nDry run complete; no files were written.' : '\nLeadSniper installation complete. Start a new Agent session to reload its Skill list.');
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
