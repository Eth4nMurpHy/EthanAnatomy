# Linux 平台扩展与版权声明 / Linux platform extension and attribution notice

## 本仓库的性质

**本仓库仅提供原应用 Anatolume 的 Linux 平台扩展。** 原应用「层知 · Anatolume」由 [isunky（Sunky）及其贡献者](https://github.com/isunky/Anatolume) 开发；[Eth4nMurpHy/Anatolume_linux](https://github.com/Eth4nMurpHy/Anatolume_linux) 的维护范围为 Linux 兼容性适配、DEB/AppImage 打包、测试与发布流程。

这里的“Linux 平台扩展”指在原有应用基础上增加 Linux 支持。仓库保留构建 Linux 客户端所需的上游源码与模型数据，应用的原始设计、核心功能及既有内容继续署名原作者和相应贡献者。原版介绍及其他平台支持请以 [原作者仓库](https://github.com/isunky/Anatolume) 为准。

本扩展由社区维护，不表示原作者或数据提供方的官方发布、认可、赞助或担保。

本声明依据上游提交 [`6b489fe242f26c3d215592f03970178d8fe3a2f7`](https://github.com/isunky/Anatolume/tree/6b489fe242f26c3d215592f03970178d8fe3a2f7) 的许可证、README、数据署名与品牌资源说明整理，核对日期为 2026-10-30。

## 应用代码与上游贡献

- **Human Atlas / ashemag**：本应用的代码基础来自 [ashemag/human-atlas](https://github.com/ashemag/human-atlas)。上游 MIT 许可证中的版权声明为：`Copyright (c) 2026 ashemag`。本仓库完整保留该声明及许可正文，见 [LICENSE](LICENSE)。
- **层知 · Anatolume / isunky（Sunky）及其贡献者**：本仓库基于其三维人体图谱、多语言界面、探索交互、离线客户端及相关文档继续适配；这些既有成果不由本仓库维护者主张原创。上游来源为 [isunky/Anatolume](https://github.com/isunky/Anatolume)。
- **本仓库的 Linux 适配**：包括 Linux DEB/AppImage 打包配置、平台更新方式适配、Linux CI/发布流程、桌面烟雾测试及 Linux 使用文档。本仓库维护者将这些新增适配代码和文档同样以 [MIT 许可证](LICENSE) 发布，不改变上游代码的许可条件，也不对上游应用、模型数据或品牌主张独占权利。

复制、修改或再分发应用代码时，应按 MIT 许可证保留原有版权声明及许可正文。MIT 许可证中的免责与责任限制继续适用。

## 解剖模型与数据

应用代码的 MIT 许可证不替代模型与源数据的 **CC BY 4.0** 许可。完整权利人、来源、许可链接、改编记录及模型局限见 [public/ATTRIBUTION.md](public/ATTRIBUTION.md)，本仓库保留该文件原文。

主要署名包括：

- **BodyParts3D / The Database Center for Life Science**：人体几何、英文名称及结构关系。保留原署名：**BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International.**
- **Kristen Browne、Heidi Schlehlein、Human Reference Atlas / HuBMAP**：*3D Reference Organ Set for Female v1.5*（2023），[DOI: 10.48539/HBM352.BTSQ.586](https://doi.org/10.48539/HBM352.BTSQ.586)，采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。
- **PrejudiceNeutrino / Human Atlas Enhanced**：女性衍生学习模型及其来源、拟合和改编记录；具体版本与几何来源见完整数据署名文件。此项致谢不替代 BodyParts3D 与 HRA 原始权利人的署名。

本次 Linux 适配未修改模型几何、解剖源数据或上游模型改编记录。再分发模型时应保留适当署名、许可链接及已有改编说明；如进一步修改，还应说明新增修改，不得暗示原作者认可衍生版本。

## 名称、图标与第三方组件

“层知”“Anatolume”名称及现有图标沿用上游资源，用于识别应用和说明来源。本仓库不主张这些上游品牌资源的原创或商标权，也不以沿用名称、图标表示官方合作关系。品牌资源的来源与制作说明见 [docs/branding/README.md](docs/branding/README.md)；本声明不为其另行创设或扩大许可。

React、Three.js、Tauri 及其他第三方组件仍适用各自许可证。本声明不将第三方组件或模型数据统一重新许可为 MIT。

对本仓库源码或二进制进行再分发时，请随附适用的许可证、版权及来源声明，包括 [LICENSE](LICENSE)、本文件和 [public/ATTRIBUTION.md](public/ATTRIBUTION.md)，并保留相关第三方许可。人体图谱用于教育与探索，不用于诊断、手术规划或临床决策。

---

## English

**This repository only provides Linux platform support for the original Anatolume application.** Anatolume is developed by [isunky (Sunky) and the upstream contributors](https://github.com/isunky/Anatolume). Eth4nMurpHy maintains Linux compatibility, DEB/AppImage packaging, tests and release integration in [Anatolume_linux](https://github.com/Eth4nMurpHy/Anatolume_linux).

“Linux platform extension” means adding Linux support to the existing application. The repository retains upstream source and models needed to build the Linux client. The original design, core features and existing content remain credited to their respective authors and contributors. Refer to the [upstream repository](https://github.com/isunky/Anatolume) for the original application and other platforms.

This is a community-maintained extension and does not imply official publication, endorsement, sponsorship or warranty by upstream authors or data providers.

This notice was checked on 2026-10-30 against upstream commit [`6b489fe242f26c3d215592f03970178d8fe3a2f7`](https://github.com/isunky/Anatolume/tree/6b489fe242f26c3d215592f03970178d8fe3a2f7).

**Application code.** The code foundation is [Human Atlas by ashemag](https://github.com/ashemag/human-atlas). Its original notice, `Copyright (c) 2026 ashemag`, and the complete MIT license are preserved in [LICENSE](LICENSE). Anatolume's existing viewer, localization, interactions, offline client and documentation are credited to isunky (Sunky) and the upstream contributors. This repository does not claim authorship of those existing works. The additional Linux packaging, updater integration, CI/release configuration, smoke tests and Linux documentation are also released under the MIT license. Preserve the original copyright and license notices when copying or redistributing applicable code; the MIT warranty disclaimer and liability limitations continue to apply.

**Anatomy data.** The code license does not replace the models' **CC BY 4.0** terms. The complete [data attribution](public/ATTRIBUTION.md) is retained unchanged, including sources, license links, adaptation records and limitations. Credits include:

- BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International.
- Kristen Browne and Heidi Schlehlein, Human Reference Atlas / HuBMAP, *3D Reference Organ Set for Female v1.5* (2023), [DOI: 10.48539/HBM352.BTSQ.586](https://doi.org/10.48539/HBM352.BTSQ.586), CC BY 4.0.
- PrejudiceNeutrino / Human Atlas Enhanced for the derived female study model and its provenance/adaptation records, in addition to the original data rights holders' credits.

The Linux adaptation does not change model geometry, source anatomy data or upstream model adaptation records. Preserve appropriate attribution, license links and existing modification notices when redistributing data, and identify any further modifications without implying endorsement.

**Branding and dependencies.** The upstream names and icons are retained to identify the application and its source. No original authorship, trademark ownership or official affiliation is claimed over them; this notice does not create or expand their license. See the [upstream branding notes](docs/branding/README.md). Third-party components remain subject to their own licenses.

When redistributing source or binaries, include the applicable licenses and notices, including [LICENSE](LICENSE), this notice and [public/ATTRIBUTION.md](public/ATTRIBUTION.md), and retain relevant third-party licenses. The anatomy viewer is for education and exploration, not clinical use.
