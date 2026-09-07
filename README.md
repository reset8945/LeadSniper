# LeadSniper

Public-comment collection and potential-user intent analysis tool. Organizes publicly visible data from short-video platforms and produces review files for human evaluation.

> **Important:** LeadSniper only collects publicly visible information through normal platform pages. It does not send messages, post comments, or perform any form of automatic or semi-automatic engagement.

## What it does

- Collects public video comments by keyword
- Classifies commenters into high / medium / low intent using local rules
- Enriches retained potential users with public profile data
- Supports recursive discovery from high-intent seeds
- Generates cleaned Excel and HTML analysis reports
- Packages customer-facing deliverables into a ZIP

## Platforms

| Platform | Executable | Debug browser launcher |
|----------|-----------|----------------------|
| Windows x64 | `LeadSniper.exe` | `start_chrome_debug.bat` |
| macOS arm64 | `./LeadSniper` | `start_chrome_debug.sh` |

## Quick start

1. Start a Chromium debug browser (Edge or Chrome required):
   - Windows: `start_chrome_debug.bat`
   - macOS: `bash start_chrome_debug.sh`
2. Scan the QR code in the opened browser to log in to your authorized account.
3. Run checks:
   ```
   LeadSniper check        # Windows
   ./LeadSniper check      # macOS
   ```
4. Start interactive collection:
   ```
   LeadSniper collect "keywordA,keywordB" --expand-keywords yes --generate-intent yes
   ```

## Commands

| Task | Command |
|------|---------|
| Check browser & login | `APP check` |
| QR login | `APP login` |
| Collect & analyze | `APP collect "keywords" --expand-keywords yes/no --generate-intent yes/no` |
| Analyze targets | `APP analyze` |
| Analyze all commenters | `APP analyze --source comments` |
| Evaluate intent rules | `APP evaluate-intent <labeled.xlsx>` |
| Update review status | `APP follow-up` |
| Settings | `APP config` |
| Set keywords | `APP config "keywordA,keywordB"` |
| View vocabulary | `APP keywords` |
| Init database | `APP init-db` |

Replace `APP` with `LeadSniper.exe` (Windows) or `./LeadSniper` (macOS).

## Outputs

- `target_customs.xlsx` — high/medium-intent potential users only
- `all_comment_users.xlsx` — every collected commenter (including low intent)
- `analysis/target_customs_clean.xlsx` — cleaned target data
- `analysis/target_customs_report.html` — filterable report
- `deliverables/leadsniper_*.zip` — customer-facing package

## Requirements

- **Windows:** Windows 10+ x64
- **macOS:** macOS arm64 (Apple Silicon)
- **Browser:** Microsoft Edge or Google Chrome (for CDP-based collection)
- **Database (optional):** MongoDB or Redis for vocabulary persistence

## Releases

| Version | Package |
|---------|---------|
| 0.1.0 | [leadsniper-0.1.0.zip](https://github.com/reset8945/LeadSniper/raw/main/leadsniper-0.1.0.zip) |

## Disclaimer

This tool works only with publicly visible information accessible through a normal authorized account. Users are responsible for complying with applicable laws, platform terms, privacy obligations, and data-retention requirements. Intent classifications are signals for human review, not confirmed facts about any individual.
