# 自动版本与全平台发布

仓库使用 [Checks, version and multiplatform release](../.github/workflows/ci.yml) 工作流，从同一个源码快照完成版本规划、检查、Windows / macOS / Web 构建、GitHub Release 发布及 GitHub Pages 部署。无需维护个人访问令牌或手动修改多个版本文件。

## 什么时候运行

| 触发方式 | 版本与发布行为 |
| --- | --- |
| 推送到 `main` | 通过检查和构建后，按 patch 递增并发布 |
| Pull request | 保留源版本，只检查与构建，不创建标签或 Release |
| 手动运行，分支为 `main` | 选择 patch / minor / major，成功后发布 |
| 手动运行，其他分支 | 只检查与构建，不发布 |

版本基于源码版本和现有 `vX.Y.Z` 标签中的最大值计算。标签按数字比较，忽略其他名称及带预发布后缀的标签。

| 选择 | 示例 |
| --- | --- |
| `patch`（默认） | `0.1.0` → `0.1.1` |
| `minor` | `0.1.9` → `0.2.0` |
| `major` | `0.1.9` → `1.0.0` |

`0.x` 在 GitHub 标为 **Pre-release**，主版本达到 `1` 后发布为正式版。版本三个数字均限制在 Windows 版本字段范围内；达到范围上限时应提升下一层版本。

## 手动选择版本增幅

在 GitHub 打开 **Actions → Checks, version and multiplatform release → Run workflow**，选择 `main`，再选择 `bump`。

也可使用已登录的 GitHub CLI：

```sh
# 发布下一个补丁版本
gh workflow run ci.yml --repo isunky/human-atlas --ref main -f bump=patch
# 发布下一个次版本
gh workflow run ci.yml --repo isunky/human-atlas --ref main -f bump=minor
```

## 一个发布包含什么

1. 读取完整标签历史并规划版本，在各个任务中应用同一个版本。
2. 在 Linux 执行类型、版本、术语、模型、交互、两种前端构建及客户端资源检查。
3. 检查通过后并行构建 Windows x64 NSIS 安装版和便携 ZIP、macOS universal DMG（Intel + Apple Silicon）、Web 静态 ZIP。macOS 会校验双架构与 ad-hoc 签名。每个平台记录版本、源码 SHA、运行 URL 与 SHA256。
4. 成功后由机器人同步提交以下五个文件，并原子推送 `main` 与 `vX.Y.Z` 标签：

   - `package.json`
   - `package-lock.json`（含根包的版本）
   - `src-tauri/tauri.conf.json`
   - `src-tauri/Cargo.toml`
   - `src-tauri/Cargo.lock`（只改本项目包版本）

5. 发布前校验所有平台产物的版本、源码和运行来源；缺失平台或校验失败阻止发布。先创建草稿 Release，上传完整资源后才公开发布。
6. Release 完成后，将同一次构建的 Web 页面部署到 [GitHub Pages](https://isunky.github.io/human-atlas/)。Web 的 `version.json` 可用于核对版本和源码。

发布附件：

| 文件 | 使用方式 |
| --- | --- |
| `Human-Atlas_X.Y.Z_x64-setup.exe` | Windows x64 安装版；缺少 WebView2 时联网下载运行时 |
| `Human-Atlas_X.Y.Z_Windows-x64-portable.zip` | 解压运行 Human-Atlas.exe；需要已安装 WebView2；设置仍保存在本机用户目录 |
| `Human-Atlas_X.Y.Z_macOS-universal.dmg` | macOS 11+，兼容 Intel 和 Apple Silicon；拖入 Applications |
| `Human-Atlas_X.Y.Z_Web.zip` | 解压部署到 HTTP/HTTPS 静态服务器，支持根目录和子目录 |
| `SHA256SUMS` | 四个发布包的 SHA256 校验值 |
| `BUILD-REPORT.md` | 版本、源码、构建运行、平台要求及 SHA256 |

文件名均不含空格，避免 GitHub 改写导致下载校验失效。Actions 保留 `release-Windows-X.Y.Z`、`release-macOS-X.Y.Z`、`release-Web-X.Y.Z` 三个 artifact 30 天，每个包含平台包和校验来源记录。Windows 未签名；macOS 使用 ad-hoc 签名，未经过 Apple 公证，首次打开可能需要在隐私与安全性中允许。签名方式参见 [Tauri 官方说明](https://v2.tauri.app/distribute/sign/macos/)。

版本提交只修改项目版本，不升级依赖。标签源码和安装包的版本一致；构建记录包含原始源码 SHA、运行链接与所有发布包 SHA256。

## 并发与失败重试

- PR 更新可取消旧检查。main 的同组运行串行执行，保留最新待运行任务，避免中途取消已开始的发布。
- 发布前核对远程 main。源码已过时时，跳过该快照的发布，由较新的 main 运行发布；原子且非强制的推送防止覆盖并发更新。
- 检查或构建失败时，不提交版本、不创建标签、不发布 Release。
- 标签提交记录源码 SHA、运行 ID 与版本增幅。同一次 Actions 运行使用 **Re-run failed jobs / Re-run all jobs** 时，会复用已分配的版本。
- 标签已推送但上传失败时，重试补齐同一版本的草稿资源；已完整公开的 Release 不会被重试覆盖。
- Release 已公开但 Pages 部署失败时，重试 Pages 任务即可，不产生新版本。
- 新的手动运行是一次新的发布，按选择的增幅规划下一个版本。恢复失败发布时，优先重试原运行。

使用仓库自动提供的 `GITHUB_TOKEN`，只在发布任务授予 `contents: write`；构建任务为读取权限；Pages 部署单独使用 `pages: write` 和 `id-token: write`，环境名为 `github-pages`。仓库 Pages 发布源需配置为 GitHub Actions；本仓库已启用。机器人推送不会递归触发 push 工作流，参见 [GitHub 的令牌事件说明](https://docs.github.com/en/actions/concepts/security/github_token#when-github_token-triggers-workflow-runs)。

如果之后启用了 main 分支保护，需要允许版本机器人按仓库规则更新 main，或改用版本 PR 流程；当前流程不会强制推送绕过保护。

## 本地检查

```sh
npm run validate:release
npm run ci:check
```

需要在本地预览下一版本时，可先输出计划；该命令不写文件：

```powershell
$env:RELEASE_ENABLED = 'true'
$env:VERSION_BUMP = 'patch'
node scripts/release-version.mjs plan
Remove-Item Env:RELEASE_ENABLED, Env:VERSION_BUMP
```

普通本地 `npm run client:build` 使用源码中已同步的版本，不会自动创建标签或发布。
