# LeadSniper

公开评论采集与潜在用户意向分析工具。从短视频平台整理公开可见数据，生成供人工评估的审查报告。

> **重要声明：** LeadSniper 仅通过正常平台页面采集公开可见的信息。不会发送消息、发表评论或执行任何形式的自动/半自动互动行为。

## 功能概述

- 按关键词采集视频公开评论
- 使用本地规则将评论者分为高/中/低意向
- 用公开资料数据补充留存的高意向潜在用户
- 支持从高意向种子用户出发的递归发现
- 生成清洗后的 Excel 和 HTML 分析报告
- 将面向客户的交付物打包为 ZIP

## 支持平台

| 平台 | 可执行文件 | 调试浏览器启动器 |
|------|-----------|----------------|
| Windows x64 | `LeadSniper.exe` | `start_chrome_debug.bat` |
| macOS arm64 | `./LeadSniper` | `start_chrome_debug.sh` |

## 快速开始

1. 启动 Chromium 调试浏览器（需要 Edge 或 Chrome）：
   - Windows：`start_chrome_debug.bat`
   - macOS：`bash start_chrome_debug.sh`
2. 在打开的浏览器中扫码登录已授权的账号。
3. 运行检查：
   ```
   LeadSniper check        # Windows
   ./LeadSniper check      # macOS
   ```
4. 启动交互式采集：
   ```
   LeadSniper collect "关键词A,关键词B" --expand-keywords yes --generate-intent yes
   ```

## 命令列表

| 任务 | 命令 |
|------|------|
| 检查浏览器与登录状态 | `APP check` |
| 扫码登录 | `APP login` |
| 采集并分析 | `APP collect "关键词" --expand-keywords yes/no --generate-intent yes/no` |
| 分析目标用户 | `APP analyze` |
| 分析所有评论者 | `APP analyze --source comments` |
| 评估意向规则 | `APP evaluate-intent <标注文件.xlsx>` |
| 更新跟进状态 | `APP follow-up` |
| 查看/修改设置 | `APP config` |
| 设置关键词 | `APP config "关键词A,关键词B"` |
| 查看词库 | `APP keywords` |
| 初始化数据库 | `APP init-db` |

将 `APP` 替换为 `LeadSniper.exe`（Windows）或 `./LeadSniper`（macOS）。

## 输出文件

- `target_customs.xlsx` — 仅包含高/中意向潜在用户
- `all_comment_users.xlsx` — 所有采集到的评论者（含低意向）
- `analysis/target_customs_clean.xlsx` — 清洗后的目标数据
- `analysis/target_customs_report.html` — 可筛选的分析报告
- `deliverables/leadsniper_*.zip` — 面向客户的交付包

## 系统要求

- **Windows：** Windows 10+ x64
- **macOS：** macOS arm64（Apple Silicon）
- **浏览器：** Microsoft Edge 或 Google Chrome（用于基于 CDP 的采集）
- **数据库（可选）：** MongoDB 或 Redis，用于词库持久化

## 版本发布

| 版本 | 安装包 |
|------|--------|
| 0.1.0 | [leadsniper-0.1.0.zip](https://github.com/reset8945/LeadSniper/raw/main/leadsniper-0.1.0.zip) |

## 免责声明

本工具仅处理通过正常授权账号可访问的公开可见信息。用户有责任遵守适用的法律法规、平台条款、隐私义务和数据留存要求。意向分类仅供人工审查参考，并非关于任何个人的确认事实。
