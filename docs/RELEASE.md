# 自动版本与全平台发布

CI 和发布由两个独立的 GitHub Actions 工作流负责：推送代码时自动检查；只有手动启动发布工作流才会更新版本、构建安装包并发布。

## CI：提交时自动运行

工作流：[Continuous integration](../.github/workflows/ci.yml)。推送任意分支或更新 PR 后自动运行类型、术语、模型和交互检查，以及 Web、Cloudflare Pages 和桌面前端构建。CI 不修改版本号、不构建桌面安装包、不创建标签或 GitHub Release。

## 发布：手动启动完整流程

工作流：[Manual version, build and release](../.github/workflows/release.yml)。在 GitHub 打开 **Actions → Manual version, build and release → Run workflow**，选择 `main` 和版本增幅：

| 选择 | 示例 |
| --- | --- |
| `patch`（默认） | `0.1.0` → `0.1.1` |
| `minor` | `0.1.9` → `0.2.0` |
| `major` | `0.1.9` → `1.0.0` |

也可以使用 GitHub CLI：

```sh
gh workflow run release.yml --repo isunky/Anatolume --ref main -f bump=patch
gh workflow run release.yml --repo isunky/Anatolume --ref main -f bump=minor
```

发布按顺序自动完成：

1. 根据项目版本、完整标签历史和所选增幅，规划一个版本，并同步 npm、Tauri 与 Rust 的五个版本文件。
2. 运行完整检查，构建 Windows x64 安装版和便携版、macOS universal DMG，以及 Web 静态 ZIP。
3. 校验所有产物来自同一个源码提交，生成 SHA256 校验清单和构建报告。
4. 在 Release notes 中列出上一个版本以来的提交摘要，并附完整变更链接。发布说明简短标明各平台下载包、数据许可与签名状况。
5. 一次性推送版本提交和 `vX.Y.Z` 标签；所有资源上传成功后才公开 GitHub Release。
6. 将同次运行构建的 Web 页面部署到 [GitHub Pages](https://isunky.github.io/Anatolume/)。

版本基于源码版本和现有正式 `vX.Y.Z` 标签中较大的值递增。`0.x` 在 GitHub 标为 **Pre-release**，主版本达到 `1` 后为正式版。版本提交只修改项目版本，不升级依赖。

## 发布附件

| 文件 | 使用方式 |
| --- | --- |
| `Anatolume_X.Y.Z_x64-setup.exe` | Windows x64 安装版；缺少 WebView2 时联网下载运行时 |
| `Anatolume_X.Y.Z_Windows-x64-portable.zip` | Windows 便携版；解压后运行，需已安装 WebView2 |
| `Anatolume_X.Y.Z_macOS-universal.dmg` | macOS 11+，兼容 Intel 和 Apple Silicon |
| `Anatolume_X.Y.Z_Web.zip` | Web 静态部署包，支持根目录和子目录 |
| `SHA256SUMS` | 四个发布包的 SHA256 校验值 |
| `BUILD-REPORT.md` | 发布版本、源码、平台和校验信息 |

**macOS 用户建议从源码自行构建。** 自动生成的 DMG 未经过 Apple 公证；Windows 程序也未签名。首次打开可能需要在系统安全设置中手动允许。

## 失败与重试

- 发布工作流只在手动选择 `main` 时创建版本和发布。其他分支不会发布。
- 检查或构建失败时，不提交版本、不创建标签、不发布 Release。
- 如果该运行的标签已经创建，使用 **Re-run failed jobs / Re-run all jobs** 会复用原版本。发布失败时优先重试原运行。
- 如果 Release 已发布但 Pages 部署失败，重试 Pages 任务即可，不产生新版本。
- 新的手动运行会规划下一个版本。请等当前发布完成后再启动下一次发布。
- 版本提交通过 `GITHUB_TOKEN` 推送，不会触发另一轮 push 工作流；普通代码提交照常触发 CI。原子推送会拒绝覆盖新的 `main` 提交。

工作流仅在发布任务授予 `contents: write`；Pages 部署单独获得 `pages: write` 和 OIDC 权限。若之后启用 `main` 分支保护，需要允许发布机器人按仓库规则更新版本提交。

## 本地开发

```sh
npm ci
npm run ci:check
```

普通本地 `npm run client:build` 使用仓库中已同步的版本，不会创建标签或发布。
