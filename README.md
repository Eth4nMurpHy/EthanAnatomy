<div align="center">

# Human Atlas

**看见身体。理解每一层。**

交互式三维人体图谱 · 中英双语 · Windows 离线客户端

[![React 19](https://img.shields.io/badge/React-19-1B6B5B?style=flat-square)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-1B6B5B?style=flat-square)](https://threejs.org/)
[![Tauri 2](https://img.shields.io/badge/Tauri-2-1B6B5B?style=flat-square)](https://tauri.app/)
[![Code: MIT](https://img.shields.io/badge/Code-MIT-31554D?style=flat-square)](LICENSE)
[![Data: CC BY 4.0](https://img.shields.io/badge/Data-CC_BY_4.0-31554D?style=flat-square)](public/ATTRIBUTION.md)

[在线演示](https://human-atlas-seven.vercel.app) · [Windows 下载](https://github.com/isunky/human-atlas/releases/tag/v0.1.0) · [快速开始](#快速开始) · [开发文档](client/README.md)

</div>

Human Atlas 将 BodyParts3D 的成年男性参考解剖模型变成可旋转、可拆解、可搜索的学习空间。从全身关系出发，逐层探索骨骼、肌肉与器官，也可以直接找到一个结构，单独观察并阅读说明。无需账号或 API 密钥。

| 独立模型零件 | 人体系统 | 具名解剖概念 | 界面语言 |
| :---: | :---: | :---: | :---: |
| **2,234** | **15** | **3,432** | **简体中文 / English** |

> 零件是独立网格，概念可以由多个零件组成。中文术语与新增学习说明尚未经医学专家审校；英文源名和源 ID 保留用于核对。本项目用于解剖学习与探索。

**导航** · [界面预览](#界面预览) · [核心体验](#核心体验) · [使用指南](#使用指南) · [Windows 客户端](#windows-客户端) · [开发与验证](#开发与验证) · [数据与授权](#数据与授权)

## 界面预览

### 主页 · 从感兴趣的结构开始

实时三维模型搭配全身、骨骼、器官三个探索入口。最近查看的结构会保存在本机，方便继续学习。

[![Human Atlas 新版主页：实时人体模型、探索入口与最近浏览](docs/screenshots/home.jpg)](docs/screenshots/home.jpg)

### 图谱 · 搜索、模型与详情各就其位

左侧查找结构或控制系统图层，中央观察三维模型，右侧阅读说明与源信息。搜索结果可直接进入单独查看，深入观察心脏等容易被外层遮挡的结构。

[![Human Atlas 核心界面：心脏搜索、三维模型与结构详情](docs/screenshots/explorer.jpg)](docs/screenshots/explorer.jpg)

以上截图以 **2× 尺寸渲染，原图为 2560 × 1800**。点击图片可查看原图。

<details>
<summary><strong>查看结构详情近景</strong> · 阅读说明、定位与周围结构切换</summary>

<p align="center">
  <a href="docs/screenshots/structure-detail.jpg"><img src="docs/screenshots/structure-detail.jpg" width="360" alt="心脏详情近景：结构说明、定位到结构、显示周围结构和返回整体"></a>
</p>

</details>

<details>
<summary><strong>查看手机界面</strong> · 紧凑导航与适配触控的布局</summary>

手机图谱使用弹出的探索工具和底部详情卡，选中结构后可展开阅读。下图展示 390 × 844 视口下的主页，以两倍尺寸采集。

<p align="center">
  <a href="docs/screenshots/home-mobile.jpg"><img src="docs/screenshots/home-mobile.jpg" width="390" alt="Human Atlas 手机主页：人体模型、开始探索按钮和模型统计"></a>
</p>

</details>

截图来自当前源码运行的真实界面，保存在 [`docs/screenshots/`](docs/screenshots/)。在线演示及已发布安装包的界面以各自版本为准。

## 核心体验

| 功能 | 可以做什么 |
| --- | --- |
| **整体与分层探索** | 在全身、骨骼、器官预设之间切换；显示、隐藏或仅看某个人体系统。 |
| **直接操作模型** | 拖动旋转、滚轮或双指缩放，点击结构查看详情；切换斜视、正面、侧面与背面。 |
| **双语结构搜索** | 按中文、英文、俗称或源 ID 查找，结果包含系统、左右信息和零件数。 |
| **聚焦与对照** | 单独查看选中结构，或恢复周围图层观察位置关系；支持定位与返回整体。 |
| **连续分解** | 从完整组装过渡到分离与零件总览，可使用滑条或桌面快捷档位。 |
| **有层次的详情** | 优先展示说明与观察提示，按需展开源信息与零件；可收起详情或加宽阅读。 |
| **连续学习** | 首页与空搜索提供最近探索入口；语言偏好和最近结构保存在本机。 |
| **网页与离线桌面** | 网页可静态部署；Windows 客户端随包提供模型，无需启动本地服务器。 |

## 使用指南

1. **选择入口**：在主页打开全身结构、骨骼与支撑或内部器官，也可以点击“开始探索”。
2. **找到目标**：直接点击模型，或搜索名称、俗称和源 ID，例如“心脏”“大腿骨”“FMA7088”。
3. **看清关系**：搜索选中后会单独显示结构；点击“显示周围结构”恢复当前图层，比较它与周围组织的位置。
4. **换个视角**：切换观察方向、拖动模型，或调节分解程度。“恢复全部”可回到默认图层与整体视角。

| 操作 | 方法 |
| --- | --- |
| 旋转模型 | 拖动三维区域 |
| 缩放模型 | 鼠标滚轮 / 双指缩放 |
| 查看结构 | 点击模型，或选择搜索结果 |
| 打开并聚焦搜索 | 点击搜索入口，或在非输入状态按 `/` |
| 选择搜索结果 | `↑` / `↓` 移动高亮，`Enter` 选择 |
| 退出搜索 | 在搜索框按 `Esc`，或点击“关闭搜索” |
| 恢复默认浏览 | 点击底部“恢复全部” |

左右均以**人体自身**为准。更多操作与中文术语维护说明见 [客户端开发文档](client/README.md)。

## 快速开始

需要 **Node.js 22.18 或更新版本**。仓库已包含可用模型，普通运行和构建无需重新转换解剖数据。

```sh
git clone https://github.com/isunky/human-atlas.git
cd human-atlas
npm ci
npm run dev
```

打开 **<http://127.0.0.1:3016/>**。开发服务器默认绑定本机，端口为 `3016`。

构建网页：

```sh
npm run build
```

静态产物位于 `dist/`，可部署到静态托管服务。Vercel 项目选择 Vite，使用 `npm ci`、`npm run build` 和 `dist` 输出目录；仓库中的 [`vercel.json`](vercel.json) 已配置这些选项。

## Windows 客户端

### 下载与安装

前往 [v0.1.0 Windows 测试版发布页](https://github.com/isunky/human-atlas/releases/tag/v0.1.0)，下载并运行 `Human Atlas_0.1.0_x64-setup.exe`。安装完成后，从开始菜单启动 **Human Atlas**。

| 项目 | 说明 |
| --- | --- |
| 支持平台 | Windows x64，按当前用户安装 |
| 离线模型 | 模型随安装包提供，启动与浏览不需要服务器、账号或网络 |
| WebView2 | 已安装运行时可离线安装；缺少运行时时，安装程序需要联网下载 |
| 语言与记录 | 首次默认简体中文，顶部可切换 English；语言与最近探索保存在本机 |
| 外部链接 | 查看数据来源和参考资料需要联网 |
| 其他平台 | macOS、Android 尚未提供经构建与验证的安装包 |

测试版尚未签名，Windows 可能显示未知发布者提示。发布页提供的是对应版本的安装包；如需包含当前源码的界面更新，可按下方步骤构建。

### 从源码构建

除 Node.js 外，还需要 **Rust MSVC 工具链、Visual Studio C++ Build Tools、Windows SDK 与 WebView2**。

```powershell
npm ci
# 启动桌面开发模式
npm run client:dev
# 生成 Windows x64 NSIS 安装包
npm run client:build
```

安装包输出目录：

```text
src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/
```

第一次 Rust 构建可能需要数分钟。详细窗口、权限、打包与平台说明见 [客户端开发文档](client/README.md)。

### 常见问题

| 情况 | 排查方法 |
| --- | --- |
| 客户端窗口空白 | 检查 WebView2 运行时与显卡驱动，关闭后重新启动。 |
| 模型加载失败 | 网页检查网络与静态模型资源；客户端尝试重新启动或重新安装测试包。 |
| 看不到想找的器官 | 使用搜索选择目标进入单独查看，或关闭遮挡它的外层系统。 |
| 需要卸载客户端 | 使用 Windows 设置中的“已安装的应用”。 |

## 开发与验证

前端使用 React 19、TypeScript、Three.js、Vite、Tailwind CSS 与 Base UI；桌面端使用 Tauri 2。网页与客户端共享界面和三维渲染逻辑。

### 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动网页开发服务器 |
| `npm run build` | 构建网页，输出到 `dist/` |
| `npm run build:client` | 构建客户端前端，输出到 `dist-client/` |
| `npm run client:dev` | 启动 Tauri 桌面开发模式 |
| `npm run client:build` | 构建 Windows x64 安装包 |
| `npm run ci:check` | 执行类型、语言、模型、交互、前端构建与客户端资源检查 |

```sh
npm run ci:check
```

检查覆盖模型缓冲区与概念归属、中文术语及双语搜索、桌面与手机比例下的分解布局、搜索/检查工具契约、点击与拖动/多指状态，以及原生与回退 gzip 解压。

浏览器交互已检查模型选择、图层预设、搜索、隔离、视角切换、分解、空图层恢复与详情面板，覆盖桌面、390 × 844、320 × 568 和 844 × 390 等视口。真实手机的性能与多指硬件操作仍需设备验证。

[GitHub Actions](.github/workflows/ci.yml) 先在 Linux 执行统一检查，通过后在 Windows 检查 Rust 格式、构建安装包并上传 artifact。工作流不会自动发布 Release。

### 项目结构

```text
app/
  page.tsx                 # 主页、图层、搜索与详情交互
  studio.css               # 主页与图谱的视觉及响应式布局
  scene.tsx                # 三维场景、相机与按需帧调度
  core/                    # 数据、搜索、分解布局与指针状态
  rendering/               # 材质、着色器与可见绘制批次
client/
  i18n/                    # 中英界面与中文术语草稿
  content/                 # 阅读引导、基础说明与搜索别名
  platform/                # 运行环境与外部链接桥接
components/ui/             # 可复用界面组件
public/models/             # 模型清单、二进制与压缩资源
src-tauri/                 # 原生窗口、权限与 Windows 打包
scripts/                   # 数据转换、压缩与验证
docs/                      # 架构文档与界面截图
```

模块边界与 CI 说明见 [核心代码与 CI](docs/PROJECT_STRUCTURE.md)。

<details>
<summary><strong>渲染与性能实现</strong></summary>

几何按批次合并，显隐变化会压紧对应批次的索引，只提交可见结构；完全隐藏的批次跳过绘制。每个结构的位置与选择状态由 GPU 纹理控制，拾取仍使用独立结构几何。分解布局与点标记只包含可见零件。

静止且相机阻尼结束后，动画循环停止请求帧；交互、状态变化、窗口调整和模型加载会唤醒，页面隐藏时暂停。分解动画复用缓存的可见集合与系统方向，屏幕拾取范围按需计算。隐藏系统减少绘制工作，但不释放已加载模型的显存。

兼容浏览器还可使用可选 WebMCP 搜索与结构检查工具；正常浏览不依赖这些工具。

</details>

<details>
<summary><strong>重新生成模型数据（可选）</strong></summary>

仓库中的模型可直接使用。只有修改数据处理流程时，才需要获取官方 BodyParts3D OBJ 压缩包与英文元数据表，准备合并后的概念和显示系统映射，再依次使用 [`convert-anatomy.py`](scripts/convert-anatomy.py)、[`optimize-anatomy.mjs`](scripts/optimize-anatomy.mjs) 与 [`compress-models.mjs`](scripts/compress-models.mjs)。转换脚本需要源目录与元数据路径，运行前请查看脚本参数。

几何简化的每结构相对误差上限为 **0.2%**，全部 2,234 个源网格均保留对应表示。修改数据后执行 `npm run ci:check` 检查模型与交互一致性。

</details>

## 数据与授权

当前模型来自 **BodyParts3D 4.0**，为成年男性参考解剖模型，不能代表所有人体结构或个体差异。模型为浏览器性能进行简化，包含 **2,288,268 个三角形**，压缩几何约 **33 MB**。

中文名称覆盖 **5,090 个唯一源名称**，目前为规则生成并补充常见词组的待审校草稿。界面保留英文原名；结构说明区分具体器官解释与一般系统概述。术语审校、搜索别名与知识内容维护方式见 [中文术语审校](client/README.md#中文术语审校)。

| 内容 | 授权与要求 |
| --- | --- |
| 原创应用代码 | [MIT License](LICENSE) |
| BodyParts3D 解剖数据 | **CC BY 4.0**；再分发时保留原始署名及改编说明 |
| 第三方依赖 | 保留各自许可证与相关要求 |

完整数据来源、许可链接和几何改编记录见 [数据署名与授权说明](public/ATTRIBUTION.md)。本项目不用于诊断、手术规划或临床决策。

## 参与改进

欢迎通过 [Issues](https://github.com/isunky/human-atlas/issues) 或 [Pull requests](https://github.com/isunky/human-atlas/pulls) 提交改进。

- **交互问题**：附上复现步骤、预期结果、浏览器或客户端版本、窗口尺寸与设备信息。
- **术语与内容修正**：提供源 ID、英文源名、建议中文名称或说明，以及可核对的参考来源。
- **代码贡献**：说明改动目的与影响，提交前运行 `npm run ci:check`；涉及 Rust 时同时运行格式检查。
- **界面改动**：同步更新 [`docs/screenshots/`](docs/screenshots/) 中对应的实际运行截图。

<details>
<summary><strong>English overview</strong></summary>

Human Atlas is an interactive 3D anatomy explorer built with React, Three.js, and Tauri. Explore **2,234 selectable meshes**, **15 anatomical systems**, and **3,432 named concepts** from the BodyParts3D adult male reference anatomy.

Rotate and select structures, toggle systems, search Chinese or English names and source IDs, isolate a structure, and move from assembled anatomy to an exploded inventory. The interface supports Chinese and English, responsive layouts, and a Windows x64 client with bundled offline models.

For local development, use Node.js **22.18+**, run `npm ci` followed by `npm run dev`, and open <http://127.0.0.1:3016/>. Run `npm run ci:check` for project validation.

Application code is MIT-licensed. Anatomy data is **CC BY 4.0**; see [ATTRIBUTION.md](public/ATTRIBUTION.md). Chinese terminology remains an unreviewed draft. This project is for education and exploration, not clinical use.

</details>
