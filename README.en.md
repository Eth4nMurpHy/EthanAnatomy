<div align="center">

<img src="docs/branding/anatolume-logo-v1.png" width="360" alt="Anatolume · 层知 bilingual brand logo">

# Anatolume · 层知

**See the body. Understand every layer.**

Interactive 3D anatomy · Chinese & English · Web and offline desktop

[简体中文](README.md) · **English**

[![Platforms](https://img.shields.io/badge/Platforms-Web%20%7C%20Windows%20%7C%20macOS-66786e?style=flat-square)](#get-started)
[![CI](https://github.com/isunky/Anatolume/actions/workflows/ci.yml/badge.svg)](https://github.com/isunky/Anatolume/actions/workflows/ci.yml)
[![Code: MIT](https://img.shields.io/badge/Code-MIT-66786e?style=flat-square)](LICENSE)
[![Data: CC BY 4.0](https://img.shields.io/badge/Data-CC_BY_4.0-66786e?style=flat-square)](public/ATTRIBUTION.md)

<p align="center">
  <a href="https://isunky.github.io/Anatolume/" target="_blank" rel="noopener noreferrer"><img src="docs/assets/github-pages-card.en.svg" width="288" height="80" alt="Try online · GitHub Pages"></a>
  &nbsp;&nbsp;
  <a href="https://anatolume.sunky.net/" target="_blank" rel="noopener noreferrer"><img src="docs/assets/cloudflare-pages-card.en.svg" width="288" height="80" alt="Try online · Cloudflare Pages"></a>
</p>

[**Download offline client**](https://github.com/isunky/Anatolume/releases) · [User guide](#get-started) · [Developer docs](#documentation)

[Preview](#preview) · [Features](#features) · [Models & licensing](#models-and-licensing) · [Contributing](#contributing) · [Acknowledgements](#acknowledgements)

</div>

Anatolume turns human anatomy into a space for rotating, revealing layers, separating systems and searching structures. Explore bones, muscles and organs in context, or isolate a structure and read its introduction. No account is required. Use the web app directly, or explore offline with both models included in the desktop client.

## Preview

Browse systems, inspect the 3D model and read structure details in one workspace. Expand a system to filter its structures and control visibility, then switch between an isolated organ and its surroundings.

[![Anatolume explorer: system list, 3D model and structure visibility](docs/screenshots/explorer.jpg)](docs/screenshots/explorer.jpg)

<details>
<summary><strong>More screenshots</strong> · Home, female model, structure details, separation and mobile</summary>

### Home

Start with the full body, bones or organs, or discover a complete organ using Random exploration in the upper right.

[![Home: exploration options and random exploration](docs/screenshots/home.jpg)](docs/screenshots/home.jpg)

### Female study model

Switch models in the header to explore breast tissue and female reproductive structures.

[![Female model: model selector, source label and statistics](docs/screenshots/female.jpg)](docs/screenshots/female.jpg)

### Structure details

Isolate a target, or smoothly locate it in its surroundings to understand its position.

[![Structure details: introduction, location and surrounding structures](docs/screenshots/structure-detail.jpg)](docs/screenshots/structure-detail.jpg)

### System separation

Systems are arranged compactly using their actual widths while preserving internal relationships. Move the slider further to enter the parts overview.

[![Separation mode: anatomical systems arranged separately](docs/screenshots/separated.jpg)](docs/screenshots/separated.jpg)

### Mobile

<p align="center">
  <a href="docs/screenshots/home-mobile.jpg"><img src="docs/screenshots/home-mobile.jpg" width="260" alt="Mobile home: anatomy model and exploration options"></a>
</p>

</details>

<sub>Actual app screenshots captured on 2026-10-12, shown with the Chinese interface; the app also supports English. Desktop originals are 2560 × 1800 and mobile is 390 × 844. Original browser JPEG output is retained; click to view full resolution. Deployed sites and desktop releases may show different versions.</sub>

## Features

| Explore | Experience |
| --- | --- |
| **Male and female models** | Switch between the male reference and female study model, with separate recent browsing histories. |
| **Layers and structures** | Full-body, bones and organs views; expand systems, filter structures, toggle individual items or show one system only. |
| **Bilingual search** | Search Chinese or English names, common aliases or source IDs such as “heart”, “心脏” or “FMA7088”. |
| **Structure focus** | Isolate a structure and read its introduction; smoothly return to the surrounding view and highlight its location. |
| **Camera and rotation** | Smooth transitions between oblique, front, side and back views; auto-rotation with direction and continuous speed controls. |
| **Random exploration** | Discover and focus on a complete organ; use “Another organ” in the details panel to continue. |
| **Privacy mode** | Hide sensitive structures in default views and random exploration; explicit searches and system or structure selections still allow viewing. |
| **Separation** | Transition from the assembled body to compact system separation and then a parts overview. |
| **Offline and updates** | Desktop models are bundled; preferences and history stay local, with checks and installation for newer releases. |

## Get started

**Online:** Open [GitHub Pages](https://isunky.github.io/Anatolume/) or [Cloudflare Pages](https://anatolume.sunky.net/), select a model and start exploring.

**Offline:** Choose a release asset from [GitHub Releases](https://github.com/isunky/Anatolume/releases).

| Edition | File | Usage |
| --- | --- | --- |
| Windows x64 installer | `Anatolume_<version>_x64-setup.exe` | Install, then launch from the Start menu. |
| Windows x64 portable | `Anatolume_<version>_Windows-x64-portable.zip` | Extract and run `Anatolume.exe`. |
| macOS universal | `Anatolume_<version>_macOS-universal.dmg` | macOS 11+, for Intel and Apple Silicon. |
| Web deployment | `Anatolume_<version>_Web.zip` | Includes pages and models; serve over HTTP/HTTPS. |

Phones can use the web app; no Android package is currently provided. Older releases may use the application's previous name.

<details>
<summary><strong>Installation, offline use and automatic updates</strong></summary>

- **Windows:** WebView2 is required. The installer downloads the runtime if missing; the portable edition requires it to be installed beforehand. The app currently has no Authenticode signature, so Windows may show an unknown publisher warning.
- **macOS:** Building from source is recommended. Generated DMGs use ad-hoc signing and are not Apple-notarized; first launch may require permission in system security settings.
- **Offline scope:** Both models are bundled. External sources, references and update downloads need a connection. Language, model preferences and recent history are stored locally.
- **Automatic updates:** The client checks for stable releases at startup. In About & acknowledgements → App updates, read changes, check manually, download and install. Offline or failed checks do not block exploration.
- **Update packages:** Installer, portable and macOS editions use their respective signed packages. Update signatures do not replace operating-system code signing. Older clients first need a manual installation of a version that supports updates.
- **Verification:** Releases include `SHA256SUMS` and `BUILD-REPORT.md`. See the [release guide](docs/RELEASE.md) for update and build details.

</details>

<details>
<summary><strong>Controls and shortcuts</strong></summary>

| Action | How |
| --- | --- |
| Rotate / zoom | Drag the model / use the wheel or pinch gesture. |
| Inspect a structure | Select it on the model, in search or in the structure list. |
| Search | Open search, or press `/` when not typing in an input. |
| Select a search result | Use `↑` / `↓`, press `Enter` to select and `Esc` to close. |
| Inspect location | Show surrounding structures, or locate the target with a smooth camera transition and highlight. |
| Continue random exploration | Use the upper-right entry or “Another organ” in the details panel. |
| Auto-rotation settings | Open the adjacent dropdown; choose direction and drag the speed slider. 100% is the maximum. |
| Privacy settings | Click the privacy icon in the bottom status bar; hover to read its current state. |
| Restore the default view | Use the restore control at the bottom. |

Left and right refer to **the body's own sides**. See the [client guide](client/README.md) for more details.

</details>

<details>
<summary><strong>Troubleshooting</strong></summary>

| Issue | Check |
| --- | --- |
| Blank desktop window | Check WebView2 and graphics drivers, then restart. |
| Model fails to load | On the web, check network and resources; on desktop, restart or reinstall. |
| Internal organs are obscured | Search and isolate the target, or hide the outer systems. |
| Uninstall on Windows | Use Installed apps in Windows Settings. |

</details>

## Models and licensing

| Model | Meshes | Systems / layers | Named concepts |
| --- | ---: | ---: | ---: |
| Male reference | 2,234 | 15 | 3,432 |
| Experimental female study model | 2,245 | 16 | 4,248 |

The female model is adapted from BodyParts3D and HRA through Human Atlas Enhanced. Proportions and placement are estimated and have not been independently reviewed. See the [female model guide](docs/FEMALE_MODEL.md) for scope and provenance.

| Content | License |
| --- | --- |
| Application code | [MIT](LICENSE), retaining the original copyright and license notices. |
| Anatomy models and source data | **CC BY 4.0**, retaining BodyParts3D and HRA credits, sources and adaptation records in [ATTRIBUTION.md](public/ATTRIBUTION.md). |
| Third-party dependencies | Their respective licenses. |

> For anatomy education and exploration, not diagnosis, surgical planning or clinical decisions. Models do not represent every structure or individual variation. Chinese terminology and added learning content have not been professionally reviewed.

<details>
<summary><strong>Data scope and processing</strong></summary>

- A concept may include multiple mesh parts; concept counts do not equal independently displayed mesh counts.
- The female model includes reproductive organs and a separate breast-tissue layer. Female external skin/genital surfaces and validated female urethra/pelvic-floor replacements are absent.
- The male model has 2,288,268 triangles and approximately 33 MB of compressed geometry; the female model has 2,437,148 triangles and approximately 35 MB. Processing uses a 0.2% per-structure relative error bound, with upstream female geometry, adaptation and verification records retained.
- Chinese terminology covers 5,172 unique source names across both models. It is a rule-generated draft with common phrases added, pending review; original English names and source IDs are retained for checking.
- Learning content distinguishes organ-specific explanations from general system descriptions. See [terminology maintenance](client/README.md#中文术语审校).

</details>

## Development

React · TypeScript · Three.js · Tauri · Vite. Web and desktop share interactions and rendering. Models are included in the repository; normal builds do not require reconversion.

Requires **Node.js 22.18+**; the repository's `.node-version` selects Node 24.

```sh
git clone https://github.com/isunky/Anatolume.git
cd Anatolume
npm ci
npm run dev
```

Local address: <http://127.0.0.1:3016/>. The development server binds to localhost by default.

| Command | Purpose |
| --- | --- |
| `npm run build` | Web build, output in `dist/`. |
| `npm run build:pages` | Cloudflare Pages build and resource validation. |
| `npm run build:client` | Desktop frontend, output in `dist-client/`. |
| `npm run client:dev` | Desktop development mode. |
| `npm run client:build` | Windows x64 NSIS installer. |
| `npm run client:build:mac` | Build a universal DMG on macOS. |
| `npm run ci:check` | Types, bilingual content, models, interactions and builds. |
| `npm run validate:release` | Version and release workflow validation. |

Native Windows builds require Rust MSVC, Visual Studio C++ Build Tools, Windows SDK and WebView2. For local builds without signed update artifacts, use `npm run client:build -- --config src-tauri/tauri.local.conf.json`; the same configuration argument applies to the macOS command. See [signing configuration](docs/RELEASE.md#发布签名密钥).

### Deployment and releases

- **Static hosting:** Serve `dist/` at a root or subpath; Web ZIP needs HTTP/HTTPS. Vercel configuration is in [vercel.json](vercel.json).
- **Cloudflare Pages:** Connect the repository's `main` branch, use `npm ci && npm run build:pages`, output `dist`, and set `SKIP_DEPENDENCY_INSTALL=1`. See the [configuration guide](docs/CLOUDFLARE_PAGES.md).
- **CI:** Pushes and PRs run checks plus Web, Pages and desktop frontend builds, without changing versions or creating releases.
- **Manual release:** Choose `patch / minor / major` to synchronize versions, build all platforms, sign update packages, publish a Release and deploy GitHub Pages. Release notes summarize the changes directly. `0.x` is marked as pre-release; versions from `1.x` are stable.

## Documentation

The following supporting guides are currently written in Chinese; the full source-data attribution file is in English.

| Guide | Contents |
| --- | --- |
| [Product requirements](docs/PRD.md) | Existing experience, proposed visual settings and deferred performance work. |
| [Desktop development](client/README.md) | Running the app, platform bridge and terminology. |
| [Architecture and CI](docs/PROJECT_STRUCTURE.md) | Modules, rendering and validation. |
| [Releases and updates](docs/RELEASE.md) | Automatic versions, platform builds, signing and retries. |
| [Cloudflare Pages](docs/CLOUDFLARE_PAGES.md) | GitHub-connected builds and deployment. |
| [Female model](docs/FEMALE_MODEL.md) | Scope, import and validation. |
| [Brand assets](docs/branding/README.md) | Full logo, original artwork and compressed assets. |
| [Data attribution](public/ATTRIBUTION.md) | Rights-holder credits, licenses and adaptations. |

Future work follows the status recorded in the PRD. Proposed visual settings and performance improvements are not current features.

## Contributing

[Issues](https://github.com/isunky/Anatolume/issues) and [pull requests](https://github.com/isunky/Anatolume/pulls) are welcome. For interaction bugs, include reproduction steps and your environment. For terminology corrections, include the source ID, suggested name and reference.

Run `npm run ci:check` before submitting code. Check Rust formatting when applicable and update screenshots for visual changes. Browser checks cover desktop and several mobile viewports; real-device performance and multi-touch still need hardware testing.

Model processing is documented in the [architecture guide](docs/PROJECT_STRUCTURE.md) and [`convert-anatomy.py`](scripts/convert-anatomy.py), [`optimize-anatomy.mjs`](scripts/optimize-anatomy.mjs), [`compress-models.mjs`](scripts/compress-models.mjs).

## Acknowledgements

Anatolume builds on open-source software and open anatomy data. Thank you to the original authors, data contributors and tool maintainers.

- **Code foundation:** [Human Atlas](https://github.com/ashemag/human-atlas) by [ashemag](https://github.com/ashemag). Anatolume extends its bilingual experience, exploration interactions and offline client, retaining the original MIT copyright and license notices.
- **BodyParts3D:** [The Database Center for Life Science](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html), providing models, English names and structure relationships under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- **Female derived model:** [PrejudiceNeutrino](https://github.com/PrejudiceNeutrino) for sharing [Human Atlas Enhanced](https://github.com/PrejudiceNeutrino/human-atlas-enhanced) and adaptation records. Source identifiers, geometry and registration records are retained.
- **HRA / HuBMAP:** Kristen Browne, Heidi Schlehlein and Human Reference Atlas / HuBMAP for *3D Reference Organ Set for Female v1.5* (2023, [DOI](https://doi.org/10.48539/HBM352.BTSQ.586)), licensed under CC BY 4.0. Full credits and adaptations are in [ATTRIBUTION.md](public/ATTRIBUTION.md).

> BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International.

Thank you to [React](https://react.dev/), [Three.js](https://threejs.org/), [Tauri](https://tauri.app/), [Vite](https://vite.dev/), [Tailwind CSS](https://tailwindcss.com/), [Base UI](https://base-ui.com/), [Lucide](https://lucide.dev/), [meshoptimizer](https://github.com/zeux/meshoptimizer), and the community members contributing feedback and improvements.
