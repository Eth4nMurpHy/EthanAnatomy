# 核心代码与 CI

## 模块职责

| 位置 | 职责 |
| --- | --- |
| `web/main.tsx` | React 入口与全局样式 |
| `app/page.tsx` | 页面、图层/搜索/详情状态与客户端桥接 |
| `app/scene.tsx` | Three.js 场景初始化、加载、相机、按需帧调度与清理 |
| `app/core/anatomy.ts` | 数据模型、系统定义、默认图层和解释 |
| `app/core/explosion-layout.ts` | 可见零件的分解布局 |
| `app/core/pointer-tap.ts` | 点击、拖动、多指和取消状态 |
| `app/core/model-download.ts` | 模型响应与 gzip 解压 |
| `app/core/agent-tools.ts` | 搜索/检查工具契约 |
| `app/core/anatomy-search.ts` | 搜索索引、所属系统/左右信息与俗称匹配提示 |
| `app/rendering/materials.ts` | 系统材质、位置/选择纹理和着色器 |
| `app/rendering/draw-batches.ts` | 可见索引压紧和绘制范围 |
| `client/` | 中英文与平台桥接 |
| `client/content/zh-CN.ts` | 中文阅读引导、基础知识、搜索别名与参考来源 |
| `src-tauri/` | 原生窗口、权限与打包 |
| `scripts/release-version.mjs` | SemVer 规划、重试复用与五个版本文件同步 |
| `scripts/release-assets.mjs` | Windows 安装/便携、macOS、Web 打包和平台来源/校验合并 |
| `scripts/publish-release.mjs` | 原子版本提交/标签与全平台 Release 发布 |

数据与交互模块不创建 WebGL 上下文。渲染模块不管理 React 状态；资源由场景创建并统一释放。模型 ID、源数据和已有 UI 保持不变。模型转换、压缩与检查脚本继续放在 `scripts/`。

## 统一检查入口

Node.js 22.18+，安装锁文件依赖后执行：

```sh
npm ci
npm run ci:check
```

入口 `scripts/ci-check.mjs` 依次执行下列已有检查和构建，任何一步失败立即返回非零退出码。使用 npm 的 JavaScript 入口启动子进程，兼容 Windows/Linux，无需 shell 拼接。

1. `check`：TypeScript。
2. `validate:release`：版本递增、版本文件同步、标签排序、重试和安装包校验。
3. `validate:locales`：术语覆盖、文案、双语搜索和语言存储。
4. `validate:atlas`：模型映射与二进制数据。
5. `validate:interactions`：布局与交互契约。
6. `build`：网页构建。
7. `build:client`：客户端前端构建。
8. `validate:client`：解压异常、打包资产、版本一致性和 Windows 配置。

## GitHub Actions

`.github/workflows/ci.yml` 在 main 推送、PR 和手动启动时运行：

- `version`（Ubuntu）：从完整标签历史规划版本；main 自动 patch，手动可选 minor/major，PR 保留源版本。
- `checks`（Ubuntu）：同步计划版本 → `npm ci` → `npm run ci:check`。
- `windows`（Windows，依赖 checks 成功）：同步版本 → 安装 Node/Rust 和锁文件依赖 → Rust 格式检查 → NSIS 构建 → 安装版和便携 ZIP 打包/来源记录 → 上传带版本的 artifact。
- `macos`（macOS）：构建 universal DMG → 验证 Intel/Apple Silicon 架构与签名 → 上传带版本的 artifact。
- `web`（Ubuntu）：静态构建 → Web ZIP 和来源记录 → 上传发布与 Pages artifact。
- `pages`（Ubuntu，Release 完成后）：使用匹配版本的 Pages artifact 部署网页。
- `release`（Ubuntu，仅 main 且前序任务成功）：校验所有平台版本/源码/SHA256 与 main 状态 → 原子推送版本提交和标签 → 将安装包、校验和构建记录完整上传后发布 Release。

PR 的旧运行会被取消，main 发布不会因新运行而中途取消；队列保留最新待运行任务。main 有更新时，旧源码的发布步骤会跳过写回，避免覆盖新提交。仅 release 任务获得 `contents: write`，Pages 单独获得部署和 OIDC 权限，构建任务保持读取权限。版本提交使用 `GITHUB_TOKEN`，不会递归触发 push 工作流。完整规则见 [自动版本与发布指南](RELEASE.md)。CI 不包含真实设备操作或性能测量。
