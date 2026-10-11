import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { displayName, systemName, text, type Locale } from "../client/i18n";
import { SYSTEMS, type Concept, type SystemId } from "./core/anatomy";

interface Props {
  locale: Locale;
  structures: Map<SystemId, Concept[]>;
  visibleIds: ReadonlySet<string>;
  ready: boolean;
  isOnly: (id: SystemId) => boolean;
  onSystem: (id: SystemId, enabled: boolean) => void;
  onOnly: (id: SystemId) => void;
  onStructure: (structure: Concept, enabled: boolean) => void;
  onInspect: (structure: Concept) => void;
}

export default function SystemLayers({ locale, structures, visibleIds, ready, isOnly, onSystem, onOnly, onStructure, onInspect }: Props) {
  const [expanded, setExpanded] = useState<SystemId | null>(null);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(24);
  const listRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef(new Map<SystemId, HTMLDivElement>());
  useEffect(() => {
    if (!expanded) return;
    const list = listRef.current, group = groupRefs.current.get(expanded);
    if (!list || !group) return;
    list.scrollTo({ top: list.scrollTop + group.getBoundingClientRect().top - list.getBoundingClientRect().top,
      behavior: query || matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, [expanded, query]);
  const t = (key: string, values: Record<string, string | number> = {}) => text(key, locale, values);
  const children = useMemo(() => (expanded ? structures.get(expanded) ?? [] : [])
    .filter((c) => `${displayName(c.name, locale)} ${c.name} ${c.id}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => displayName(a.name, locale).localeCompare(displayName(b.name, locale), locale)), [structures, expanded, query, locale]);
  return <div ref={listRef} className="system-list" aria-describedby="layer-help">
    {SYSTEMS.filter((s) => structures.has(s.id)).map((system) => {
      const items = structures.get(system.id)!;
      const ids = items.flatMap((c) => c.elements);
      const shown = ids.filter((id) => visibleIds.has(id)).length;
      const name = systemName(system.id, system.name, locale);
      const open = expanded === system.id;
      return <div ref={(node) => { if (node) groupRefs.current.set(system.id, node); else groupRefs.current.delete(system.id); }} className={`system-group ${open ? "is-expanded" : ""}`} key={system.id}>
        <div className={`system-row ${shown ? "enabled" : ""}`}>
          <button className="system-name" aria-expanded={open} aria-controls={`system-children-${system.id}`} aria-label={t(open ? "Collapse {name} structures" : "Browse {name} structures", { name })}
            onClick={() => { setExpanded(open ? null : system.id); setQuery(""); setLimit(24); }}>
            <ChevronRight size={12} className="system-chevron" aria-hidden="true" />
            <span className="system-dot" style={{ background: system.color }} />
            <span className="system-label">{name}</span>
            <span className="system-count" title={t("{shown} of {total} pieces visible", { shown, total: ids.length })}>{shown && shown < ids.length ? `${shown}/${ids.length}` : ids.length}</span>
          </button>
          <Button variant="ghost" className="system-only" aria-label={t("Show only {name}", { name })} aria-pressed={isOnly(system.id)} onClick={() => onOnly(system.id)} disabled={!ready}>{t("Only")}</Button>
          <Switch checked={shown > 0} onCheckedChange={(enabled) => onSystem(system.id, enabled)} aria-label={t("Show {name}", { name })} disabled={!ready} />
        </div>
        {open && <section id={`system-children-${system.id}`} className="system-children" aria-label={t("{name} structures", { name })}>
          <label className="structure-filter"><Search size={13} aria-hidden="true" /><input value={query} onChange={(e) => { setQuery(e.target.value); setLimit(24); }} placeholder={t("Filter structures")} aria-label={t("Filter {name} structures", { name })} /></label>
          <p className="structure-summary">{t("{count} structures", { count: children.length })}<span>{t("Click a name to inspect")}</span></p>
          {children.slice(0, limit).map((structure) => {
            const count = structure.elements.filter((id) => visibleIds.has(id)).length;
            const label = displayName(structure.name, locale);
            return <div className={`structure-row ${count ? "is-visible" : ""}`} key={structure.id}>
              <button className="structure-name" title={structure.name} onClick={() => onInspect(structure)} disabled={!ready}>
                <span>{label}</span>{structure.elements.length > 1 && <small>{count && count < structure.elements.length ? t("{shown} of {total} pieces visible", { shown: count, total: structure.elements.length }) : t("{count} pieces", { count: structure.elements.length })}</small>}
              </button>
              <Switch size="sm" checked={count > 0} onCheckedChange={(enabled) => onStructure(structure, enabled)} aria-label={t("Show structure: {name}", { name: label })} disabled={!ready} />
            </div>;
          })}
          {!children.length && <p className="structure-empty">{t("No matching structures")}</p>}
          {children.length > limit && <Button variant="ghost" className="structure-more" onClick={() => setLimit((n) => n + 24)}>{t("Show more ({count} remaining)", { count: children.length - limit })}</Button>}
        </section>}
      </div>;
    })}
  </div>;
}
