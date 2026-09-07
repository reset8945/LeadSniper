---
name: leadsniper
description: Analyze publicly visible comments with LeadSniper, retain high- and medium-intent potential users, preserve all collected comments, generate Excel/HTML reports, evaluate intent rules, and update manual review status. Use for check, login, collect, analyze, evaluate-intent, follow-up, config, keywords, or init-db workflows.
---

# LeadSniper workflow

LeadSniper is a public-comment collection and potential-user intent analysis tool. It organizes public data and produces review files. It does not send messages, post comments, or perform automatic or semi-automatic replies.

Use `APP` below as the executable placeholder. For an npm-installed Skill,
resolve paths relative to the directory containing this `SKILL.md` and invoke
the executable by absolute path:

- Windows npm installation: `scripts/LeadSniper.exe`
- macOS npm installation: `scripts/LeadSniper`
- Windows standalone release: `LeadSniper.exe`
- macOS standalone release: `./LeadSniper`
- Source mode: `uv run python main.py`

The npm installation also includes `scripts/start_chrome_debug.bat` on Windows
or `scripts/start_chrome_debug.sh` on macOS. Run the matching launcher when the
browser preflight reports that Edge or Chrome is not available in debug mode.

## Response contract

When handling a LeadSniper request:

1. Restate the requested keywords, purpose, and limits before starting a browser collection.
2. Ask only for material values that are missing. Do not repeatedly ask for values already supplied.
   Before every collection, obtain two separate user choices: model-assisted search-keyword expansion, and model-assisted high/medium-intent vocabulary generation. Missing answers are not `no`. A stored API key, cached vocabulary, previous run, or request to "start collecting" is not a choice for this run. An explicit standing preference may be reused if it clearly applies; state that preference in the run summary.
3. Explain whether the requested action is a browser action, a local analysis action, or a configuration action.
4. Run the required preflight checks before browser collection.
5. Report the exact result path after completion. Prefer the generated delivery ZIP for customer-facing handoff.
6. Describe high and medium intent as signals requiring human review, never as confirmed identity, purchasing behavior, or personal fact.
7. If access, login, provenance, or authorization cannot be verified, stop and clearly state what the user must resolve.

## Required boundaries

- Work only with information visible through normal public pages and an authorized account.
- Keep keywords, video counts, comment counts, profile counts, and retention proportional to the stated purpose.
- Follow applicable law, platform terms, privacy obligations, and data-retention requirements.
- Never attempt to bypass access controls, rate limits, login controls, verification challenges, or restricted content.
- Never add messaging, comment posting, automatic replies, semi-automatic replies, or engagement automation.
- Never infer sensitive traits or use sensitive personal data for targeting.
- Require human review before outreach, external use, or a business decision.
- Support appropriate correction, deletion, and retention handling for exported data.
- Never expose API keys, authorization files, browser profiles, Cookie values, database credentials, or private runtime state.

## Command reference

| Task | Command | External dependency |
|---|---|---|
| Check browser and login readiness | `APP check` | Debug browser |
| Guide an authorized QR login | `APP login` | Edge or Chrome |
| Collect public video comments and analyze intent | `APP collect "keywordA,keywordB" --expand-keywords yes/no --generate-intent yes/no` | Browser; model only for choices set to yes |
| Analyze the active target workbook | `APP analyze` | Local files only |
| Analyze the all-comment workbook | `APP analyze --source comments` | Local files only |
| Evaluate intent rules against a labeled workbook | `APP evaluate-intent <labeled.xlsx>` | Local file only |
| Update manual review status | `APP follow-up` | Local target workbook |
| Open the settings workflow | `APP config` | Local settings; database optional |
| Set keywords non-interactively | `APP config "keywordA,keywordB"` | Local settings; database optional |
| View configured intent vocabulary | `APP keywords` | Configured database |
| Initialize the configured vocabulary database | `APP init-db` | MongoDB or Redis service |

The menu provides the same functional routes:

1. Authorized Douyin login
2. Public video-comment collection and high/medium-intent analysis
3. Manual follow-up status
4. Analysis report
5. Configuration
6. Intent vocabulary view
7. Database initialization
0. Exit

## Collection inputs

Before `collect`, determine these values:

- Keywords: one or more search terms separated by commas.
- Maximum videos: applies separately to each keyword before video-ID deduplication.
- Maximum comments: applies to each video. A value of `0` means all comments currently available to the normal page session.
- Sort: `latest` processes newest publications first; `hot` processes the most popular results first.
- Lead cap: maximum combined count of retained high- and medium-intent users.
- Profile cap: maximum number of public profiles collected in the current pass; `--profiles 0` disables profile enrichment.
- Recursive depth: `--depth 0` disables recursion; positive values bound recursive expansion.
- Users per depth: `--users-per-depth` limits high-intent seeds at each depth.
- Model-assisted search expansion: required `--expand-keywords yes` or `no`.
- Model-assisted intent vocabulary generation: required `--generate-intent yes` or `no`.

### Mandatory model-choice conversation

Ask the user before invoking collection, including when keywords already exist:

1. “是否使用大模型扩充相关搜索关键词？选择是会增加检索范围，每关键词的视频上限会应用到扩充后的每个词。”
2. “是否使用大模型生成高/中意向词库？选择是会重新生成；选择否则复用已有词库，没有时使用内置通用词。”

The choices are independent. Explain that `yes` sends the selected keyword text to the configured model provider and can consume API quota. It does not send collected comments or profile data in this preparation step. Do not request API keys in chat; direct the user to local settings or `DEEPSEEK_API_KEY`.

Map answers exactly to the two flags. Never insert `no/no` simply to make a command run. If the user says only “use the model,” clarify whether they want search expansion, intent vocabulary generation, or both. If the user already explicitly supplied both choices for this run, do not ask again. `yes` for search expansion authorizes searching the returned same-topic terms under the agreed per-keyword limit; explain this scope before asking.

Confirm or propose any missing numeric limits, sorting, profile enrichment, and recursion settings in a compact run summary. Do not silently assume all comments, extra profiles, or recursive discovery. Pass agreed values explicitly so local saved defaults cannot broaden the run.

`APP config "keywords"` only sets keywords/reuses storage; it does not generate vocabulary and is not a substitute for the two choices. Interactive collection and configuration can offer similar-bundle reuse. During interactive collection this occurs only after generation is declined and no exact bundle exists; the user must choose a displayed bundle number or `0` to decline. Do not select a similar bundle on the user's behalf or claim that the non-interactive collection CLI offers automatic similar-bundle selection.

The collection CLI requires both flags and exits before settings loading or browser startup when either is absent. Interactive collection asks both questions even when retaining the current keywords or an existing bundle; an empty response does not skip them. If the program asks for these values unexpectedly, return to the user instead of inventing answers.

For a scripted run after the user explicitly declines both model options and agrees to these limits:

```text
APP collect "keywordA,keywordB" --expand-keywords no --generate-intent no --videos 10 --comments 100 --leads 50 --profiles 50 --sort latest --depth 0 --users-per-depth 20
```

Use `yes/no`, `no/yes`, or `yes/yes` instead when those are the user's choices; the literal string `yes/no` is a placeholder, not an accepted argument. Reject negative comment, profile, and depth values; video, lead, and users-per-depth limits must be positive. Do not silently broaden the requested scope.

## Browser preflight

For any browser collection:

1. Run `APP check`.
2. If it reports ready, continue.
3. If it reports that login is missing, run `APP login` and ask the authorized user to complete QR login in the opened browser.
4. Run `APP check` again after login.
5. If the browser cannot start, report that Edge or Chrome must be installed or started with the supplied debug-browser launcher.
6. Do not begin collection until browser readiness and the intended account are confirmed.

Login state is kept in the dedicated browser profile. Do not export browser Cookies or copy the browser profile into result or delivery files.

## End-to-end collection logic

### 1. Keyword preparation

- Load the selected keyword group and its saved intent vocabulary when available.
- Run search expansion only for `--expand-keywords yes`. Retain the original words and deduplicate returned terms. Then prepare the vocabulary for the final keyword group.
- Generate fresh high/medium-intent words only for `--generate-intent yes`, even if a cached bundle exists. `no` reuses available words and fills missing lists with built-in generic vocabulary.
- Runtime classification remains local and rule based.
- If an explicitly requested model operation fails or has no usable result, stop before browser collection. Do not silently fall back, substitute another model, change the flags, or retry indefinitely. Ask whether to retry after correcting configuration or continue with an explicit `no` choice.
- A database persistence failure is separate: the prepared words remain available in memory for this run, with a warning that they were not saved. Do not claim persistence succeeded.
- Report the final search terms and vocabulary source/counts from the command output; never claim model generation occurred on a `no` path.
- Treat generated vocabulary as configuration, not as proof about a person.

### 2. Public video discovery

- Search each keyword independently.
- Apply the configured maximum video count to each keyword.
- Deduplicate matching results by video ID across all keywords.
- Sort the final video list by the selected newest-first or popularity-first mode.
- Save search details under `01_search/<keyword>/videos.xlsx`.

### 3. Public comment collection

- Visit each selected public video through the normal browser session.
- Collect up to the configured per-video comment limit.
- Save every collected comment for that video to `02_comments/<video-id>/comments.xlsx`.
- Classify each comment as high, medium, or low intent using local rules and available video context.
- After each completed video, rebuild `all_comment_users.xlsx` so completed progress remains available if a later step is interrupted.

### 4. All-comment aggregation

`all_comment_users.xlsx` is the complete commenter aggregate for every collected video:

- Retain high-, medium-, and low-intent commenters.
- Group repeated comments by the best available user identifier.
- Preserve all distinct collected comment texts.
- Record comment count, most recent comment time, source-video count, titles, and links.
- Keep the highest observed intent level for the same user.
- Include comments from both initial keyword videos and recursive discovery videos.

Do not describe `all_comment_users.xlsx` as a target-only list.

### 5. Target selection and capacity priority

`target_customs.xlsx` contains only high- and medium-intent potential users:

- Keep the highest intent signal when the same user appears more than once.
- Order high-intent rows before medium-intent rows.
- When the configured lead cap still has room, accept either high or medium intent.
- When the cap is full, a newly found high-intent user may replace an existing medium-intent user.
- A medium-intent user must not displace a high-intent user.
- Preserve existing manual follow-up status when the workbook is regenerated.

### 6. Public profile enrichment

- Collect only public profile fields for retained potential users.
- Store profile working data in `03_profiles/potential_user_profiles.xlsx`.
- Merge available biography, follower count, work count, business-account indicator, region, and publicly stated contact text into the target record.
- Keep failed profile attempts visible as failed collection status rather than inventing values.
- Never infer missing contact information or private attributes.

### 7. Recursive discovery

- Use only high-intent users as recursive discovery seeds.
- Do not expand from medium-intent users.
- Read only the seed user's publicly visible videos, up to configured depth and per-depth limits.
- Keep only videos related to the active keyword context.
- Save those video details under `04_user_videos/<sec_uid>/videos.xlsx`.
- Collect comments from the selected related videos and write them to the normal per-video comment directory.
- Add recursive comments to the same `all_comment_users.xlsx` aggregate.
- Apply the same high-over-medium capacity rule to newly found potential users.
- Collect public profiles for newly retained users and exclude any displaced medium-intent profile from final counts.

### 8. Final analysis and delivery

After collection:

- Write `target_customs.xlsx`.
- Deduplicate and clean target rows into `analysis/target_customs_clean.xlsx`.
- Generate `analysis/target_customs_report.html`.
- Create one current `deliverables/leadsniper_*.zip` package.
- Print or return the exact `DELIVERABLE_PATH` when available.

## Output contract

Each keyword group has a separate directory under `output/Test/collections/`.

Customer-facing outputs:

- `all_comment_users.xlsx`: every collected commenter and comment, including low intent
- `target_customs.xlsx`: high/medium-intent users only
- `analysis/target_customs_clean.xlsx`: cleaned target data
- `analysis/target_customs_report.html`: filterable target report
- `collection.log`: redacted workflow log
- `deliverables/leadsniper_*.zip`: approved customer-facing files

Internal working outputs:

- `01_search/<keyword>/videos.xlsx`
- `02_comments/<video-id>/comments.xlsx`
- `03_profiles/potential_user_profiles.xlsx`
- `04_user_videos/<sec_uid>/videos.xlsx`
- collection metadata and active-runtime JSON

The delivery ZIP must exclude settings, credentials, authorization files, browser profiles, Cookie data, database state, per-video details, per-user video details, and unrelated local files.

## Intent interpretation

High-intent signals may include:

- Explicit price or fee questions
- Clear purchase, registration, appointment, or cooperation requests
- Directly relevant requests for a guide, material, resource, or next step
- A numeric or short call-to-action phrase only when the public video context gives it a clear action meaning

Medium-intent signals may include:

- Relevant interest or comparison
- A request to learn more without a clear commitment
- Suitability, difficulty, or entry-threshold questions
- Consideration or trial interest that still requires review

Low-intent or excluded interactions include:

- Generic praise
- Like, bookmark, or passive-viewing statements
- Unrelated location questions
- Negative or rejecting statements
- Low-relevance interaction without a meaningful intent signal

Use context and negation handling. Never convert an ambiguous comment into a stronger level solely to fill a target list.

## Analysis commands

### Default target analysis

`APP analyze` reads the active `target_customs.xlsx`, deduplicates usable high/medium-intent rows, and writes cleaned Excel and HTML outputs.

### All-comment analysis

`APP analyze --source comments` reads `all_comment_users.xlsx`. Use it when the user explicitly wants analysis across the complete collected-comment population rather than only the retained target list.

### Offline rule evaluation

`APP evaluate-intent <labeled.xlsx>` compares local rule output with human labels. The labeled workbook requires:

- `评论内容`
- `预期意向`

Optional context fields include:

- `视频ID`
- `用户sec_uid`
- `视频描述`

Report evaluation results as rule-quality evidence, not as proof about individual users.

## Manual follow-up

`APP follow-up` updates human review status in the active `target_customs.xlsx`.

- Preserve the original intent data and source links.
- Update only the intended review-status field.
- Do not send a message or perform platform interaction.
- Keep follow-up decisions manual and reviewable.

## Configuration and vocabulary storage

`APP config` opens interactive settings. `APP config "keywordA,keywordB"` changes the active keywords non-interactively.

The default vocabulary backend is local MongoDB and may be changed to Redis. These are server-side storage choices for keyword vocabulary; they are not mandatory for basic collection on every end-user machine.

- `APP init-db` verifies and initializes the configured backend.
- `APP keywords` lists stored keyword bundles.
- If the database is unavailable, report the persistence limitation and use the built-in generic intent words where the program supports fallback.
- Do not claim successful database initialization unless the command returns success.
- Never include database credentials or connection internals in a customer delivery.

## Failure handling

- Login missing: pause collection and request authorized QR login.
- Browser unavailable: report the browser requirement and launcher option.
- No videos found: report the keywords and selected limits; do not fabricate results.
- Page structure or response unavailable: preserve completed files, report the affected stage, and stop if data integrity cannot be verified.
- Database unavailable: distinguish vocabulary persistence failure from basic collection fallback.
- Model unavailable after a `yes` choice: collection stops; ask for corrected local configuration or explicit permission to change the choice. Existing/built-in fallback is available only when generation is explicitly declined.
- Profile request failed: keep the failure status and do not invent profile values.
- Report or ZIP generation failed: keep the completed workbooks and return their paths.
- Interrupted collection: point to the latest per-video files and incrementally written `all_comment_users.xlsx`.

## Delivery checklist

Before handing off results:

1. Confirm the output belongs to the requested keyword group.
2. Confirm `all_comment_users.xlsx` and `target_customs.xlsx` are not confused.
3. Confirm target rows contain only high/medium intent and high intent is ordered first.
4. Confirm recursive comments are included in the all-comment aggregate.
5. Confirm a cleaned workbook and HTML report exist when analysis completed.
6. Prefer the latest generated delivery ZIP.
7. Confirm no settings, credentials, authorization data, browser profile, Cookie data, database state, or internal raw details entered the delivery.
8. Remind the user that intent results require human verification.
