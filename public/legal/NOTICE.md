# 版权、依赖与来源声明

本仓库当前开发一个名称待定的跨平台人体学习 App，由 Eth4nMurpHy 维护。新工作区的界面、状态、检索、模型加载及场景控制位于 `studio/`，采用新的实现。正式名称尚未确定，技术打包标签为 Anatomy Workspace Dev。

## 技术依赖

新工作区直接使用 React、TypeScript、Three.js（含 OrbitControls）、Vite、Tauri / Rust、Lucide 与 fflate。这些第三方组件适用各自许可证；本项目不主张其原创权利。

## 参考与实际继承

系统分层观察、结构显隐和聚焦等交互思路参考了 [isunky（Sunky）及贡献者开发的 Anatolume](https://github.com/isunky/Anatolume)。新应用不使用该项目的旧页面与交互模块作为运行入口。

仓库的早期阶段曾基于 Anatolume 进行 Linux 移植。该阶段的代码、脚本、工程基础与文档保留在 `legacy/` 和 Git 历史中，原有版权声明继续适用；现有数据文件与部分构建基础也沿袭该阶段。Anatolume 的代码基础进一步来自 [ashemag / Human Atlas](https://github.com/ashemag/human-atlas)，原始 MIT 声明 `Copyright (c) 2026 ashemag` 予以保留。

新工作区代码与本仓库新增贡献按 MIT 许可发布。根目录 [LICENSE](LICENSE) 保留原始许可正文和相应版权通知；[legacy/LICENSE](legacy/LICENSE) 保留早期许可证原文。实现与继承边界见 [studio/PROVENANCE.md](studio/PROVENANCE.md)。本声明不表示任何上游作者的官方发布、认可、赞助或担保。

## 模型数据

模型数据及其已有处理产物不是本项目原创。代码的 MIT 许可不替代数据的 CC BY 4.0 许可。完整权利人、来源链接、已有改编记录和局限保留在 [public/ATTRIBUTION.md](public/ATTRIBUTION.md)。本次新工作区未修改这些模型几何文件。

- **BodyParts3D**：BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International.
- **HRA / HuBMAP**：Kristen Browne and Heidi Schlehlein, _3D Reference Organ Set for Female v1.5_ (2023), DOI https://doi.org/10.48539/HBM352.BTSQ.586, CC BY 4.0.
- **Human Atlas Enhanced / PrejudiceNeutrino**：女性衍生学习模型及其来源、拟合和改编记录；此项致谢不替代原始数据权利人的署名。

再分发时保留适用的代码许可、版权通知、数据署名、许可链接和改编记录。新应用的技术标识与通用开发图标不主张上游名称或品牌的权利。旧品牌资源仅在历史资料中保留，不作为新工作区的产品标志。

本应用用于教育与探索，不用于诊断、手术规划或临床决策。

## English

This repository develops an unnamed, independently maintained cross-platform anatomy learning application. The current UI, application state, search, model loader and scene controller in `studio/` use a new implementation built directly with React, TypeScript, Three.js / OrbitControls, Vite, Tauri / Rust, Lucide and fflate. Their respective licenses remain applicable.

Layered exploration, visibility controls and focus interactions were informed by Anatolume by isunky (Sunky) and contributors. The repository previously ported Anatolume to Linux; that stage's code, scripts, documentation and license notices are preserved in `legacy/` and Git history. Existing data files and parts of the build foundation are inherited from that stage. The original Human Atlas notice, `Copyright (c) 2026 ashemag`, is retained. See LICENSE, legacy/LICENSE and studio/PROVENANCE.md for the implementation/provenance boundaries. The project is not an official upstream distribution and does not imply endorsement.

Model data and its existing processed representations are not original to this project. They retain their CC BY 4.0 terms, BodyParts3D, HRA / HuBMAP and Human Atlas Enhanced credits, source links and adaptation records in public/ATTRIBUTION.md. The current workspace does not modify those geometry files. Preserve applicable code licenses, data attribution and modification notices on redistribution. Educational use only; not for clinical decisions.
