# 项目来源与版权声明 / Project provenance and attribution notice

## 本仓库的性质

**本仓库正在开发一款名称待定、独立维护的跨平台三维人体学习应用。** 原应用「层知 · Anatolume」由 [isunky（Sunky）及其贡献者](https://github.com/isunky/Anatolume) 开发，本仓库基于该应用继续开发交互优化及 Windows、macOS、Linux、Web 支持，由 Eth4nMurpHy 维护后续开发。

本项目此前定位为 Linux 平台扩展，已发布的 Linux 预览包仍使用上游名称。现进入独立衍生应用的开发阶段；正式产品名称、品牌图标、发行标识与独立更新签名尚待确定。开发界面使用“三维图谱 / 3D atlas”作为功能描述。

应用的上游设计、核心功能、模型数据及既有内容继续署名原作者和相应贡献者。独立维护不改变这些成果的版权与许可，也不表示原作者或数据提供方的官方发布、认可、赞助或担保。原版与官方发布请以 [原作者仓库](https://github.com/isunky/Anatolume) 为准。

本声明依据上游提交 [`6b489fe242f26c3d215592f03970178d8fe3a2f7`](https://github.com/isunky/Anatolume/tree/6b489fe242f26c3d215592f03970178d8fe3a2f7) 的许可证、README、数据署名与品牌资源说明整理，核对日期为 2026-10-30。

## 应用代码与上游贡献

- **Human Atlas / ashemag**：本应用的代码基础来自 [ashemag/human-atlas](https://github.com/ashemag/human-atlas)。上游 MIT 许可证中的版权声明为：`Copyright (c) 2026 ashemag`。本仓库完整保留该声明及许可正文，见 [LICENSE](LICENSE)。
- **层知 · Anatolume / isunky（Sunky）及其贡献者**：本仓库基于其三维人体图谱、多语言界面、探索交互、离线客户端及相关文档继续适配；这些既有成果不由本仓库维护者主张原创。上游来源为 [isunky/Anatolume](https://github.com/isunky/Anatolume)。
- **本仓库的后续贡献**：包括 Linux DEB/AppImage 打包配置、平台更新方式适配、CI/发布流程、桌面烟雾测试、交互优化、浏览器回归测试及相关文档。本仓库维护者将这些新增适配代码和文档同样以 [MIT 许可证](LICENSE) 发布，不改变上游代码的许可条件，也不对上游应用、模型数据或品牌主张独占权利。

复制、修改或再分发应用代码时，应按 MIT 许可证保留原有版权声明及许可正文。MIT 许可证中的免责与责任限制继续适用。

## 解剖模型与数据

应用代码的 MIT 许可证不替代模型与源数据的 **CC BY 4.0** 许可。完整权利人、来源、许可链接、改编记录及模型局限见 [public/ATTRIBUTION.md](public/ATTRIBUTION.md)，本仓库保留该文件原文。

主要署名包括：

- **BodyParts3D / The Database Center for Life Science**：人体几何、英文名称及结构关系。保留原署名：**BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International.**
- **Kristen Browne、Heidi Schlehlein、Human Reference Atlas / HuBMAP**：*3D Reference Organ Set for Female v1.5*（2023），[DOI: 10.48539/HBM352.BTSQ.586](https://doi.org/10.48539/HBM352.BTSQ.586)，采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。
- **PrejudiceNeutrino / Human Atlas Enhanced**：女性衍生学习模型及其来源、拟合和改编记录；具体版本与几何来源见完整数据署名文件。此项致谢不替代 BodyParts3D 与 HRA 原始权利人的署名。

本次 Linux 适配未修改模型几何、解剖源数据或上游模型改编记录。再分发模型时应保留适当署名、许可链接及已有改编说明；如进一步修改，还应说明新增修改，不得暗示原作者认可衍生版本。

## 名称、图标与第三方组件

仓库保留“层知”“Anatolume”名称及相关上游图标，用于来源说明、历史版本和后续替换时核对。当前开发界面使用功能描述和通用图标，正式品牌尚未确定。本仓库不主张这些上游品牌资源的原创或商标权，也不以沿用名称、图标表示官方合作关系。品牌资源的来源与制作说明见 [docs/branding/README.md](docs/branding/README.md)；本声明不为其另行创设或扩大许可。

React、Three.js、Tauri 及其他第三方组件仍适用各自许可证。本声明不将第三方组件或模型数据统一重新许可为 MIT。

对本仓库源码或二进制进行再分发时，请随附适用的许可证、版权及来源声明，包括 [LICENSE](LICENSE)、本文件和 [public/ATTRIBUTION.md](public/ATTRIBUTION.md)，并保留相关第三方许可。人体图谱用于教育与探索，不用于诊断、手术规划或临床决策。

---

## English

**This repository develops an independently maintained, unnamed cross-platform 3D anatomy application**, based on [Anatolume by isunky (Sunky) and the upstream contributors](https://github.com/isunky/Anatolume). Eth4nMurpHy maintains further interaction improvements and Windows, macOS, Linux and Web development.

The repository previously provided a Linux platform extension; its existing Linux previews still use the upstream name. The final product name, artwork, distribution identity and independent update signing are pending. “3D atlas” is a descriptive development placeholder.

The upstream application design, core features, model data and existing content remain credited to their authors and contributors. Independent maintenance does not alter those copyrights or licenses or imply official publication, endorsement, sponsorship or warranty by upstream authors or data providers. Refer to the [upstream repository](https://github.com/isunky/Anatolume) for the original application and official releases.

This notice was checked on 2026-10-30 against upstream commit [`6b489fe242f26c3d215592f03970178d8fe3a2f7`](https://github.com/isunky/Anatolume/tree/6b489fe242f26c3d215592f03970178d8fe3a2f7).

**Application code.** The code foundation is [Human Atlas by ashemag](https://github.com/ashemag/human-atlas). Its original notice, `Copyright (c) 2026 ashemag`, and the complete MIT license are preserved in [LICENSE](LICENSE). Anatolume's existing viewer, localization, interactions, offline client and documentation are credited to isunky (Sunky) and the upstream contributors. This repository does not claim authorship of those existing works. The additional Linux packaging, updater integration, CI/release configuration, smoke tests, interaction improvements, browser regression tests and related documentation are also released under the MIT license. Preserve the original copyright and license notices when copying or redistributing applicable code; the MIT warranty disclaimer and liability limitations continue to apply.

**Anatomy data.** The code license does not replace the models' **CC BY 4.0** terms. The complete [data attribution](public/ATTRIBUTION.md) is retained unchanged, including sources, license links, adaptation records and limitations. Credits include:

- BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International.
- Kristen Browne and Heidi Schlehlein, Human Reference Atlas / HuBMAP, *3D Reference Organ Set for Female v1.5* (2023), [DOI: 10.48539/HBM352.BTSQ.586](https://doi.org/10.48539/HBM352.BTSQ.586), CC BY 4.0.
- PrejudiceNeutrino / Human Atlas Enhanced for the derived female study model and its provenance/adaptation records, in addition to the original data rights holders' credits.

The Linux adaptation does not change model geometry, source anatomy data or upstream model adaptation records. Preserve appropriate attribution, license links and existing modification notices when redistributing data, and identify any further modifications without implying endorsement.

**Branding and dependencies.** Upstream names and icons are retained for source attribution, historical releases and reference during future replacement. The development UI uses descriptive text and generic icons while the final brand is pending. No original authorship, trademark ownership or official affiliation is claimed over them; this notice does not create or expand their license. See the [upstream branding notes](docs/branding/README.md). Third-party components remain subject to their own licenses.

When redistributing source or binaries, include the applicable licenses and notices, including [LICENSE](LICENSE), this notice and [public/ATTRIBUTION.md](public/ATTRIBUTION.md), and retain relevant third-party licenses. The anatomy viewer is for education and exploration, not clinical use.
