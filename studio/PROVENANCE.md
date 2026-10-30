# 新工作区的实现与来源边界

`studio/App.tsx`、`Viewer.tsx`、`domain.ts`、`data.ts` 与 `workspace.css` 在本次新应用开发阶段重新编写。它们直接使用 React、Three.js、OrbitControls、Lucide、fflate 与 Tauri 的公共 API，不导入 `legacy/` 中的界面、搜索、状态管理、材质或相机实现。

新渲染器按系统合并几何，通过可见索引重建处理显隐、通过顶点颜色标记选中结构，并通过显式命令执行相机定位。显隐和 ResizeObserver 只更新几何或投影，不触发相机取景。数据加载器按现有模型清单记录的字节偏移读取 float32 顶点、归一化 int16 法线和 uint32 索引，校验长度与索引边界。

数据的二进制格式及现有模型文件来自仓库已有处理产物，不能表述为本项目原创。BodyParts3D、HRA / HuBMAP 和 Human Atlas Enhanced 的署名与改编记录继续保留，详见 `public/ATTRIBUTION.md`。常用中文检索词是本工作区的小范围检索映射，不作为经审校的完整医学译名库。

早期移植阶段使用过 Anatolume / Human Atlas 的代码和构建基础。相关源码、脚本、文档和旧许可证保留在 `legacy/`，Git 历史完整保留。现有 npm/Cargo 版本锁定基础、Tauri/Vite 工程配置及模型数据沿袭该阶段并作调整；相关原始版权通知保留在根 LICENSE / NOTICE 中。

思路层面参考了 Anatolume 的系统分层、显隐和聚焦体验。对外说明区分“技术依赖”“处理后的数据来源”“实际继承的工程基础”和“交互思路参考”，不将整个工程宣称为没有任何上游继承的净室实现。
