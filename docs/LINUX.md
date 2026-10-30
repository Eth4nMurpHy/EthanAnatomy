# Linux 桌面版

当前项目已进入名称待定的跨平台应用开发阶段，见 [开发路线](DEVELOPMENT.md)。现有预览包和构建文件名仍沿用 Anatolume。开发源码通过 `client/release-channel.ts` 暂停应用内自动更新，正式命名、独立身份及签名配置完成前请采用手动更新。下文的 AppImage 更新能力描述适用于平台支持及此前的 Linux 扩展版本。

Linux 与 Windows、macOS 共享 React / Three.js 界面、男女模型、搜索、语言与本机偏好存储。新增 x86_64 原生客户端及 DEB、AppImage 打包；不需要登录或重新转换模型。

## 从源码构建

推荐在 Ubuntu 22.04 上构建，保持发布包的 glibc 基线。较新发行版构建的程序不保证在旧发行版运行。原生 ARM64 包不在本次发布范围。

安装 Node.js 24、Rust stable（至少 1.90）及系统依赖：

```sh
sudo apt-get update
sudo apt-get install -y build-essential curl wget file libwebkit2gtk-4.1-dev libxdo-dev libayatana-appindicator3-dev librsvg2-dev patchelf
npm ci
npm run client:dev
```

离线安装包的本地构建无需发布密钥：

```sh
npm run client:build:linux -- --config src-tauri/tauri.local.conf.json -- --locked
```

输出目录：`src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/`，其中 `deb/` 提供 `Anatolume_<version>_amd64.deb`，`appimage/` 提供 `Anatolume_<version>_amd64.AppImage`。模型和署名随前端内嵌，运行时不依赖 Vite 或互联网。

仅构建 DEB：

```sh
npm run tauri -- build --target x86_64-unknown-linux-gnu --bundles deb --config src-tauri/tauri.local.conf.json -- --locked
```

## 安装与运行

DEB（Debian/Ubuntu；需要发行版提供 WebKitGTK 4.1）：

```sh
sudo apt install ./Anatolume_<version>_amd64.deb
anatolume
```

也可在桌面应用菜单中找到 Anatolume。包管理器会安装 GTK 3 与 WebKitGTK 4.1 依赖。Ubuntu 22.04 上请启用提供这些依赖的 universe 软件源。

AppImage：

```sh
chmod +x Anatolume_<version>_amd64.AppImage
./Anatolume_<version>_amd64.AppImage
```

AppImage 仍需要兼容的 Linux 系统、图形会话和驱动，不保证支持所有发行版。挂载运行需要 FUSE 2（Ubuntu 24.04 的包名为 `libfuse2t64`，较旧版本通常为 `libfuse2`）。无法使用 FUSE 时：

```sh
./Anatolume_<version>_amd64.AppImage --appimage-extract
./squashfs-root/AppRun
```

解压运行与 DEB 一样使用手动更新。桌面需提供 X11 或 Wayland；无显示会话的服务器不适合作为日常客户端。

## 更新与发布

- DEB 与直接运行的二进制不显示应用内更新控件，也不向更新服务发请求。下载新 DEB 后再次执行 `sudo apt install ./新包.deb`。
- 挂载运行的 AppImage 支持 Tauri 签名更新；请放在当前用户可写的位置。离线或更新失败不影响人体图谱。
- 本地构建关闭签名产物生成；这不关闭已发布更新的签名验证。
- 正式发布使用现有 `Manual version, build and release` 流程：Linux 作业生成 DEB、AppImage 和 AppImage 签名，合并步骤校验四个平台的版本、来源与 SHA256，并将 `linux-x86_64` 写入 `latest.json`。
- Fork 发布前必须在 Tauri 配置中设置自己的更新端点和公钥，并在 GitHub Secrets 中配置对应的 `TAURI_SIGNING_PRIVATE_KEY` 和密码；不能使用上游公钥来验证自己的密钥。默认端点仍指向上游，未配置独立发布前请使用手动安装。不要将私钥提交到仓库。详见 [发布指南](RELEASE.md)。

## 验证

```sh
npm run ci:check
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --manifest-path src-tauri/Cargo.toml --lib --locked
```

可在图形会话中安装并运行桌面烟雾测试（先完成原生构建）：

```sh
cargo install tauri-driver --locked
npm run smoke:linux
# 无桌面 CI，需先安装 xvfb xauth dbus-x11 webkit2gtk-driver libgl1-mesa-dri：
LIBGL_ALWAYS_SOFTWARE=1 WEBKIT_DISABLE_DMABUF_RENDERER=1 xvfb-run -a dbus-run-session -- npm run smoke:linux
```

测试默认启动 release 二进制，使用真实 WebKit WebView 和原生 IPC，验证两套模型加载、结构选择、语言和模型偏好保存。可通过 `TAURI_APP_PATH` 指向从 DEB 解包的程序；测试 AppImage 时另设 `TAURI_EXPECT_APPIMAGE=1`。测试脚本使用临时 XDG 数据、配置与缓存目录，结束后清理，不改变日常客户端偏好。

CI 在 Ubuntu 22.04 上执行原生测试、构建 DEB，并从安装包解包启动桌面烟雾测试。发布流程额外构建签名 AppImage。实际桌面验收应覆盖：启动男女模型、旋转与缩放、搜索并聚焦结构、语言切换、重启后的偏好保存，以及离线模型加载。X11、Wayland 和不同 GPU 的实机体验仍需分别验收。

## English

Linux x86_64 packages share the existing offline anatomy viewer. Build on Ubuntu 22.04 with Node 24, stable Rust and the dependencies listed above. Use `npm run client:build:linux -- --config src-tauri/tauri.local.conf.json -- --locked` for local DEB and AppImage builds without a signing key. DEB requires WebKitGTK 4.1 from the distribution. AppImage needs a compatible graphics session and FUSE 2, or explicit extraction. Only mounted AppImages support signed self-updates; DEB and extracted binaries use manual installation. Configure your own updater endpoint, public key and signing secrets before publishing from a fork.

## Linux 预览包下载

前往 [本仓库 Releases](https://github.com/Eth4nMurpHy/Anatolume_linux/releases) 下载 Linux DEB 或 AppImage。`Build and publish Linux preview` 工作流在 GitHub 内构建、验证并上传预览包，无需维护者提供私有签名密钥。修改该工作流并推送到 main 会自动触发，也可在 Actions 中手动运行。每次发布都附带源码提交、构建链接、版权声明及 SHA256 校验值。正式的跨平台签名发布仍使用原有发布流程。
