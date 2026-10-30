import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Box,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Focus,
  Info,
  Layers3,
  Menu,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { isTauri } from "@tauri-apps/api/core";
import Viewer from "./Viewer";
import { assetUrl } from "./data";
import {
  DEFAULT_SYSTEMS,
  SYSTEMS,
  partSelection,
  searchAtlas,
  visiblePart,
  type Atlas,
  type Command,
  type ModelId,
  type Part,
  type Selection,
} from "./domain";
import "./workspace.css";
const STORE = "anatomy-workspace-dev.v1";
type Saved = { model: ModelId; selection: Selection };
function savedState(): { model: ModelId; bookmarks: Saved[] } {
  try {
    const v = JSON.parse(localStorage.getItem(STORE) ?? "{}");
    return {
      model: v.model === "female" ? "female" : "male",
      bookmarks: Array.isArray(v.bookmarks)
        ? v.bookmarks
            .filter(
              (b: Saved) =>
                ["male", "female"].includes(b.model) &&
                b.selection &&
                typeof b.selection.id === "string" &&
                typeof b.selection.name === "string" &&
                Array.isArray(b.selection.parts) &&
                b.selection.parts.every((id) => typeof id === "string"),
            )
            .slice(0, 100)
        : [],
    };
  } catch {
    return { model: "male", bookmarks: [] };
  }
}
async function external(url: string) {
  if (isTauri()) {
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(url);
  } else window.open(url, "_blank", "noopener,noreferrer");
}
export default function App() {
  const searchInput = useRef<HTMLInputElement>(null);
  const [stored] = useState(savedState),
    [model, setModel] = useState<ModelId>(stored.model),
    [atlas, setAtlas] = useState<Atlas | null>(null);
  const [systems, setSystems] = useState(new Set(DEFAULT_SYSTEMS)),
    [hidden, setHidden] = useState(new Set<string>()),
    [selection, setSelection] = useState<Selection | null>(null),
    [isolate, setIsolate] = useState(false),
    [opacity, setOpacity] = useState(1);
  const [command, setCommand] = useState<Command>({
      serial: 0,
      action: "home",
    }),
    [progress, setProgress] = useState(0),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  const [query, setQuery] = useState(""),
    [tab, setTab] = useState<"systems" | "bookmarks">("systems"),
    [bookmarks, setBookmarks] = useState<Saved[]>(stored.bookmarks),
    [sidebar, setSidebar] = useState(false),
    [details, setDetails] = useState(false),
    [about, setAbout] = useState(false),
    [attribution, setAttribution] = useState("");
  const ready = progress === 100 && !error;
  const issue = useCallback(
    (action: Command["action"]) =>
      setCommand((c) => ({ serial: c.serial + 1, action })),
    [],
  );
  const onStatus = useCallback((value: number, message?: string) => {
    setProgress(value);
    setError(message ?? "");
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify({ model, bookmarks }));
    } catch {
      /* Learning remains available without storage. */
    }
  }, [model, bookmarks]);
  useEffect(() => {
    document.title = "人体学习工作台 · 开发版";
    if (isTauri())
      void import("@tauri-apps/api/window")
        .then(({ getCurrentWindow }) =>
          getCurrentWindow().setTitle("人体学习工作台 · 开发版"),
        )
        .catch(() => {});
  }, []);
  useEffect(() => {
    if (!about) return;
    const controller = new AbortController();
    void fetch(assetUrl("ATTRIBUTION.md"), { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.text();
      })
      .then(setAttribution)
      .catch(() => {
        if (!controller.signal.aborted)
          setAttribution(
            "完整模型来源记录见应用内附带的 ATTRIBUTION.md 与项目仓库。",
          );
      });
    return () => controller.abort();
  }, [about]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbout(false);
        setSidebar(false);
        setDetails(false);
      }
      if (
        e.key === "/" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setSidebar(true);
        requestAnimationFrame(() => searchInput.current?.focus());
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    if (!about) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>(".about-dialog");
    dialog?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !dialog) return;
      const nodes = [
        ...dialog.querySelectorAll<HTMLElement>("button,summary,a[href],input"),
      ];
      const first = nodes[0],
        last = nodes[nodes.length - 1];
      if (
        e.shiftKey &&
        (document.activeElement === first || document.activeElement === dialog)
      ) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [about]);
  const changeModel = (next: ModelId) => {
    if (next === model) return;
    setAtlas(null);
    setSelection(null);
    setHidden(new Set());
    setSystems(new Set(DEFAULT_SYSTEMS));
    setIsolate(false);
    setQuery("");
    setProgress(0);
    setError("");
    setModel(next);
    issue("home");
  };
  const choose = (row: Selection) => {
    if (!atlas) return;
    const valid = new Set(atlas.parts.map((p) => p.id)),
      ids = row.parts.filter((id) => valid.has(id));
    if (!ids.length) return;
    setSelection({ ...row, parts: ids });
    setHidden((h) => new Set([...h].filter((id) => !ids.includes(id))));
    setSystems(
      (previous) =>
        new Set([
          ...previous,
          ...atlas.parts.filter((p) => ids.includes(p.id)).map((p) => p.system),
        ]),
    );
    setDetails(true);
    setSidebar(false);
  };
  const onPick = useCallback((part: Part) => {
    setSelection(partSelection(part));
    setDetails(true);
  }, []);
  const results = useMemo(
    () => (atlas ? searchAtlas(atlas, query) : []),
    [atlas, query],
  );
  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const p of atlas?.parts ?? [])
      result[p.system] = (result[p.system] ?? 0) + 1;
    return result;
  }, [atlas]);
  const shown = useMemo(
    () =>
      atlas?.parts.filter((p) =>
        visiblePart(
          p,
          systems,
          hidden,
          isolate ? new Set(selection?.parts ?? []) : null,
        ),
      ).length ?? 0,
    [atlas, systems, hidden, isolate, selection],
  );
  const selectedParts = useMemo(
    () => atlas?.parts.filter((p) => selection?.parts.includes(p.id)) ?? [],
    [atlas, selection],
  );
  const saved = bookmarks.some(
    (b) => b.model === model && b.selection.id === selection?.id,
  );
  const toggleBookmark = () => {
    if (!selection) return;
    setBookmarks((list) =>
      saved
        ? list.filter(
            (b) => !(b.model === model && b.selection.id === selection.id),
          )
        : [...list, { model, selection }].slice(-100),
    );
  };
  const resetLayers = () => {
    setSystems(new Set(DEFAULT_SYSTEMS));
    setHidden(new Set());
    setIsolate(false);
  };
  const toggleSystem = (id: string) => {
    setIsolate(false);
    setSystems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const selectedSystems = [...new Set(selectedParts.map((p) => p.system))];
  return (
    <div className="workspace">
      <header className="workspace-header">
        <div className="workspace-identity">
          <span className="identity-icon">
            <Box size={23} />
          </span>
          <div>
            <strong>人体学习工作台</strong>
            <span>ANATOMY WORKSPACE</span>
          </div>
          <small>开发版 · 名称待定</small>
        </div>
        <div className="header-actions">
          <button
            className="mobile-menu"
            onClick={() => setSidebar(true)}
            aria-label="打开结构面板"
          >
            <Menu size={18} />
          </button>
          <label className="model-picker">
            <span>学习模型</span>
            <select
              aria-label="学习模型"
              value={model}
              onChange={(e) => changeModel(e.target.value as ModelId)}
            >
              <option value="male">男性参考模型</option>
              <option value="female">女性学习模型</option>
            </select>
          </label>
          <button className="about-button" onClick={() => setAbout(true)}>
            <Info size={17} />
            <span>关于与来源</span>
          </button>
        </div>
      </header>
      <div className="workspace-body">
        {sidebar && (
          <button
            className="panel-shade"
            aria-label="关闭结构面板"
            onClick={() => setSidebar(false)}
          />
        )}
        <aside className={`library-panel ${sidebar ? "open" : ""}`}>
          <div className="panel-title">
            <div>
              <span className="eyebrow">STRUCTURE LIBRARY</span>
              <h1>探索人体结构</h1>
            </div>
            <button
              className="mobile-close"
              aria-label="关闭结构面板"
              onClick={() => setSidebar(false)}
            >
              <X size={18} />
            </button>
          </div>
          <label className="structure-search">
            <Search size={17} />
            <input
              ref={searchInput}
              aria-label="搜索人体结构"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="心脏、femur 或结构编号"
            />
            <kbd>/</kbd>
          </label>
          <p className="search-hint">英文名称、常用中文关键词或源 ID</p>
          <div className="library-tabs">
            <button
              className={tab === "systems" ? "active" : ""}
              onClick={() => {
                setTab("systems");
                setQuery("");
              }}
            >
              <Layers3 size={15} />
              人体系统
            </button>
            <button
              className={tab === "bookmarks" ? "active" : ""}
              onClick={() => {
                setTab("bookmarks");
                setQuery("");
              }}
            >
              <Bookmark size={15} />
              收藏{" "}
              <small>{bookmarks.filter((b) => b.model === model).length}</small>
            </button>
          </div>
          <div className="library-content">
            {query.trim() ? (
              <>
                <div className="list-caption">
                  检索结果{" "}
                  <span>{results.length === 60 ? "60+" : results.length}</span>
                </div>
                {!ready ? (
                  <p className="empty-copy">模型加载完成后可检索。</p>
                ) : results.length ? (
                  results.map((row) => (
                    <button
                      key={row.id}
                      className={`structure-result ${selection?.id === row.id ? "active" : ""}`}
                      onClick={() => choose(row)}
                    >
                      <span>{row.name}</span>
                      <small>
                        {row.id} · {row.parts.length} 个零件
                      </small>
                      <ChevronRight size={15} />
                    </button>
                  ))
                ) : (
                  <p className="empty-copy">
                    没有找到匹配结构。试试英文名称，例如 heart 或 femur。
                  </p>
                )}
              </>
            ) : tab === "bookmarks" ? (
              <>
                <div className="list-caption">当前模型的收藏</div>
                {bookmarks
                  .filter((b) => b.model === model)
                  .map((b) => (
                    <div className="bookmark-row" key={b.selection.id}>
                      <button
                        className="structure-result"
                        onClick={() => choose(b.selection)}
                      >
                        <span>{b.selection.name}</span>
                        <small>{b.selection.id}</small>
                      </button>
                      <button
                        aria-label={`移除收藏 ${b.selection.name}`}
                        onClick={() =>
                          setBookmarks((v) => v.filter((x) => x !== b))
                        }
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                {!bookmarks.some((b) => b.model === model) && (
                  <p className="empty-copy">
                    选中一个结构，点击“收藏”，为下次学习留下入口。
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="list-caption">
                  系统显隐{" "}
                  <button onClick={resetLayers} disabled={!ready}>
                    恢复图层
                  </button>
                </div>
                {Object.entries(SYSTEMS)
                  .filter(([id]) => (counts[id] ?? 0) > 0)
                  .map(([id, system]) => (
                    <div className="system-item" key={id}>
                      <span
                        className="system-color"
                        style={{ background: system.color }}
                      />
                      <div>
                        <strong>{system.label}</strong>
                        <small>{counts[id]} 个零件</small>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={systems.has(id)}
                        aria-label={`显示${system.label}`}
                        disabled={!ready}
                        onClick={() => toggleSystem(id)}
                        className={`system-switch ${systems.has(id) ? "checked" : ""}`}
                      >
                        <span />
                      </button>
                    </div>
                  ))}
              </>
            )}
          </div>
          <div className="library-footer">
            <span className={`status-indicator ${ready ? "ready" : ""}`} />
            {ready
              ? `已加载 ${atlas?.parts.length.toLocaleString()} 个零件`
              : "正在准备模型"}
            <span>本地学习</span>
          </div>
        </aside>
        <main className="canvas-panel">
          <Viewer
            key={`${model}:${retry}`}
            model={model}
            state={{ systems, hidden, selection, isolate, opacity, command }}
            onAtlas={setAtlas}
            onSelect={onPick}
            onStatus={onStatus}
          />
          <div className="canvas-heading">
            <span className="eyebrow">YOUR EXPLORATION SPACE</span>
            <h2>从整体，到一个结构。</h2>
            <p>{isolate ? "单独观察所选结构" : "自由旋转，逐层理解人体。"}</p>
          </div>
          <div className="canvas-status">
            <span className="status-indicator ready" />
            {model === "male" ? "男性参考" : "女性衍生学习"}
            <span>{shown.toLocaleString()} 个零件可见</span>
          </div>
          {error ? (
            <div className="load-panel error" role="alert">
              <Info size={24} />
              <strong>模型暂时无法显示</strong>
              <p>{error}</p>
              <button
                onClick={() => {
                  setError("");
                  setRetry((v) => v + 1);
                }}
              >
                重新加载
              </button>
            </div>
          ) : !ready ? (
            <div className="load-panel" role="status">
              <div className="loader-orbit" />
              <strong>准备三维学习空间</strong>
              <p>正在读取离线模型 · {progress}%</p>
              <progress value={progress} max={100} />
            </div>
          ) : shown === 0 ? (
            <div className="load-panel">
              <EyeOff size={25} />
              <strong>当前没有可见结构</strong>
              <button onClick={resetLayers}>恢复默认图层</button>
            </div>
          ) : null}
          <div className="viewer-help">
            拖动旋转<span>·</span>滚轮 / 双指缩放<span>·</span>点击选择
          </div>
          <nav className="camera-toolbar" aria-label="相机控制">
            <div>
              <button disabled={!ready} onClick={() => issue("front")}>
                正面
              </button>
              <button disabled={!ready} onClick={() => issue("side")}>
                侧面
              </button>
              <button disabled={!ready} onClick={() => issue("back")}>
                背面
              </button>
            </div>
            <i />
            <button
              aria-label="放大"
              disabled={!ready}
              onClick={() => issue("zoomIn")}
            >
              <ZoomIn size={18} />
            </button>
            <button
              aria-label="缩小"
              disabled={!ready}
              onClick={() => issue("zoomOut")}
            >
              <ZoomOut size={18} />
            </button>
            <i />
            <button
              aria-label="重置视角"
              disabled={!ready}
              onClick={() => issue("home")}
            >
              <RotateCcw size={18} />
            </button>
          </nav>
          <button className="mobile-details" onClick={() => setDetails(true)}>
            <SlidersHorizontal size={17} />
            {selection ? "结构详情" : "学习面板"}
          </button>
        </main>
        <aside className={`details-panel ${details ? "open" : ""}`}>
          <div className="details-top">
            <span className="eyebrow">STUDY INSPECTOR</span>
            <button
              className="mobile-close"
              aria-label="关闭详情"
              onClick={() => setDetails(false)}
            >
              <X size={18} />
            </button>
          </div>
          {selection ? (
            <>
              <div className="selected-icon">
                <Focus size={26} />
              </div>
              <span className="detail-label">已选结构</span>
              <h2 className="selected-name">{selection.name}</h2>
              <code>{selection.id}</code>
              <div className="system-tags">
                {selectedSystems.map((id) => (
                  <span key={id}>{SYSTEMS[id]?.label ?? id}</span>
                ))}
              </div>
              <dl>
                <div>
                  <dt>组成零件</dt>
                  <dd>{selection.parts.length}</dd>
                </div>
                <div>
                  <dt>所属模型</dt>
                  <dd>{model === "male" ? "男性" : "女性"}</dd>
                </div>
                <div>
                  <dt>数据来源</dt>
                  <dd>开放解剖数据</dd>
                </div>
              </dl>
              <button className="primary-action" onClick={() => issue("focus")}>
                <Focus size={17} />
                聚焦所选结构
              </button>
              <div className="selection-actions">
                <button
                  aria-pressed={isolate}
                  onClick={() => setIsolate((v) => !v)}
                >
                  <Eye size={16} />
                  {isolate ? "显示周围" : "单独观察"}
                </button>
                <button onClick={toggleBookmark}>
                  {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}{" "}
                  {saved ? "已收藏" : "收藏"}
                </button>
              </div>
              <button
                className="hide-selected"
                onClick={() => {
                  setHidden((old) => new Set([...old, ...selection.parts]));
                  setSelection(null);
                  setIsolate(false);
                }}
              >
                <EyeOff size={15} />
                隐藏所选结构
              </button>
              <p className="detail-note">
                结构名称与编号保留数据源原文，便于核对。选择和切换显隐不会改变你的观察视角。
              </p>
            </>
          ) : (
            <div className="inspector-empty">
              <div className="empty-target">
                <Focus size={35} />
              </div>
              <h2>让观察更有方向</h2>
              <p>
                点击模型上的一个部位，
                <br />
                或从左侧搜索一个结构。
              </p>
              <ol>
                <li>
                  <span>01</span>选择你想了解的结构
                </li>
                <li>
                  <span>02</span>聚焦或单独观察
                </li>
                <li>
                  <span>03</span>收藏，继续下一次学习
                </li>
              </ol>
            </div>
          )}
          <section className="appearance-control">
            <div>
              <SlidersHorizontal size={15} />
              <strong>模型透明度</strong>
              <span>{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              aria-label="模型透明度"
              min="0.2"
              max="1"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
            />
          </section>
          <p className="scope-note">
            用于解剖学习与探索。女性模型为衍生学习模型，比例和位置未经独立解剖验证。
          </p>
        </aside>
      </div>
      <footer className="workspace-footer">
        <span>BodyParts3D / HRA · CC BY 4.0</span>
        <button onClick={() => setAbout(true)}>技术、数据与参考来源</button>
        <span>Windows · macOS · Linux · Web</span>
      </footer>
      {about && (
        <div
          className="dialog-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAbout(false);
          }}
        >
          <section
            className="about-dialog"
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            aria-labelledby="about-title"
          >
            <button
              className="dialog-close"
              aria-label="关闭关于"
              onClick={() => setAbout(false)}
            >
              <X size={21} />
            </button>
            <span className="eyebrow">ABOUT THIS WORKSPACE</span>
            <h2 id="about-title">一个新的学习工作区</h2>
            <p>
              名称待定，正在独立开发。当前界面、状态模型和三维场景控制采用新的实现，面向
              Windows、macOS、Linux 和 Web。
            </p>
            <h3>直接使用的技术</h3>
            <p>
              React · TypeScript · Three.js · Vite · Tauri · Rust · Lucide ·
              fflate
            </p>
            <h3>思路参考与历史来源</h3>
            <p>
              层级观察、结构显隐和聚焦等交互思路参考了层知（Anatolume）。仓库保留了早期移植阶段的代码与构建基础，其原有许可证和署名继续保留。
            </p>
            <button
              className="text-link"
              onClick={() =>
                void external("https://github.com/isunky/Anatolume").catch(
                  () => {},
                )
              }
            >
              Anatolume · isunky（Sunky）及贡献者 <ChevronRight size={15} />
            </button>
            <h3>模型数据与许可</h3>
            <p>
              模型数据继续使用现有开放数据资产：BodyParts3D、HRA / HuBMAP，以及
              Human Atlas Enhanced 的女性衍生模型。几何处理和改编记录保留原文。
            </p>
            <details>
              <summary>查看完整模型来源与改编记录</summary>
              <pre>{attribution || "正在读取本地来源记录…"}</pre>
            </details>
            <button
              className="text-link"
              onClick={() =>
                void external(
                  "https://github.com/Eth4nMurpHy/Anatolume_linux",
                ).catch(() => {})
              }
            >
              项目源码与版权声明 <ChevronRight size={15} />
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
