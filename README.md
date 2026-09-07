# LeadSniper

[English](https://www.npmjs.com/package/leadsniper) | [中文文档](https://github.com/reset8945/LeadSniper/blob/main/README_CN.md)

## Install

Run LeadSniper directly with `npx`; no global installation is required:

```bash
npx --yes leadsniper@latest
```

The installer detects macOS Apple Silicon or Windows x64, finds supported Agents,
and asks where LeadSniper should be installed.

Install into one or more Agents explicitly:

```bash
npx --yes leadsniper@latest --agent codex
npx --yes leadsniper@latest --agent claude,codex
```

## Update

Run the installer again to update every detected installation:

```bash
npx --yes leadsniper@latest --all --yes
```

Update a specific Agent:

```bash
npx --yes leadsniper@latest --agent codex --yes
```

Updates replace only the published Skill files, LeadSniper executable, and debug
browser launcher. Existing configuration, browser profiles, databases, and output
data are preserved. Replaced published files are backed up before an update.

## Community

Join the LeadSniper WeChat community:

<img src="https://github.com/reset8945/LeadSniper/releases/download/v0.1.0/wechat_group_qr.png" alt="LeadSniper WeChat community QR code" width="280">

[Open the QR code or view the v0.1.0 release](https://github.com/reset8945/LeadSniper/releases/tag/v0.1.0)

## Installer options

```text
--agent <names>  Install into comma-separated Agents
--all            Install into every detected Agent
--yes, -y        Update existing installations without prompting
--dry-run        Show what would change without writing files
--list           Show detected Agents and installation paths
--help, -h       Show help
```

Supported Agents are Hermes, OpenClaw, Claude Code, and Codex. The original
platform-specific installers remain available:

```bash
npx --yes leadsniper-mac@latest
npx --yes leadsniper-win@latest
```

## What LeadSniper does

LeadSniper collects publicly visible short-video comments through a normal,
authorized browser session and organizes them for human review. It can:

- Discover public videos by keyword.
- Collect and retain public comments.
- Classify high-, medium-, and low-intent signals with local rules.
- Enrich retained potential users with public profile information.
- Generate cleaned Excel and HTML reports.
- Preserve complete comment aggregates and package customer-facing deliverables.

LeadSniper does not send messages, post comments, or automate engagement. Intent
levels are signals for human review, not confirmed facts about a person.

## Requirements

- Node.js 18 or newer and npm 9 or newer.
- macOS 14 or newer on Apple Silicon (`arm64`), or Windows 10/11 (`x64`).
- Microsoft Edge or Google Chrome for browser collection.
- Hermes, OpenClaw, Claude Code, or Codex.
- MongoDB or Redis only when vocabulary persistence is needed.

Intel Mac, Windows ARM64, and Linux are not currently supported.

## Getting started

After installation, open a new Agent session so its Skill list reloads. Ask the
Agent to use LeadSniper and provide the intended keywords and collection limits.
Before collection, LeadSniper requires separate choices for model-assisted search
keyword expansion and model-assisted intent-vocabulary generation.

Common runtime commands include:

```text
LeadSniper check
LeadSniper login
LeadSniper collect "keywordA,keywordB" --expand-keywords yes --generate-intent yes
LeadSniper analyze
LeadSniper follow-up
LeadSniper config
```

The installed Skill gives the Agent the correct executable path for the current
operating system.

## Outputs

- `all_comment_users.xlsx`: every collected commenter, including low intent.
- `target_customs.xlsx`: high- and medium-intent potential users only.
- `analysis/target_customs_clean.xlsx`: cleaned target data.
- `analysis/target_customs_report.html`: filterable analysis report.
- `deliverables/leadsniper_*.zip`: approved customer-facing files.

## Safety and privacy

- Use only publicly visible information available through a normal authorized account.
- Follow applicable law, platform terms, privacy obligations, and retention rules.
- Never submit API keys, cookies, database credentials, or login profiles in chat.
- Human review is required before outreach, external use, or business decisions.
- Do not use LeadSniper to bypass access controls, verification, or rate limits.

## Maintainer commands

```bash
npm test
npm run pack:check
npm run release:check

npm publish --workspace packages/macos
npm publish --workspace packages/windows
npm publish --workspace packages/cli
```

Publish both platform packages before publishing the unified `leadsniper` package.

## License

LeadSniper is proprietary software. See `LICENSE` for the applicable terms.
