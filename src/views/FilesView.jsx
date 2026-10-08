import { useMemo, useState } from "react";
import { FileText, FolderOpen, Image as ImageIcon, Presentation, Search, Table, Video, X } from "lucide-react";
import EmptyState from "../components/EmptyState";
import { allFiles } from "../lib/planner";
import { fmtBytes, norm } from "../lib/utils";

const KIND_META = {
  pdf: { label: "ملفات PDF", icon: <FileText size={17} />, cls: "k-pdf" },
  slides: { label: "عروض", icon: <Presentation size={17} />, cls: "k-slides" },
  doc: { label: "مستندات", icon: <FileText size={17} />, cls: "k-doc" },
  img: { label: "صور", icon: <ImageIcon size={17} />, cls: "k-img" },
  sheet: { label: "جداول", icon: <Table size={17} />, cls: "k-sheet" },
  video: { label: "فيديو", icon: <Video size={17} />, cls: "k-video" },
};

export default function FilesView({ data, api }) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("all");
  const files = useMemo(() => allFiles(data), [data]);
  const kinds = useMemo(() => {
    let set = new Set(files.map(f => f.kind));
    return ["all", ...Object.keys(KIND_META).filter(k => set.has(k))];
  }, [files]);

  const filtered = files.filter(f =>
    (kind === "all" || f.kind === kind) && (!q.trim() || norm(f.name).includes(norm(q)))
  );

  const groups = useMemo(() => {
    let m = new Map();
    filtered.forEach(f => { if (!m.has(f.courseName)) m.set(f.courseName, []); m.get(f.courseName).push(f); });
    return [...m.entries()];
  }, [filtered]);

  if (!files.length) {
    return (
      <EmptyState icon={<FolderOpen />} title="مكتبتك لسه فاضية"
        text="افتح أي مادة وحط ملفات محاضرتها — هتلاقيها كلها هنا مرتّبة."
        action={<button className="primary ripple-host pressable" onClick={() => api.go("courses")}>روح للمواد</button>} />
    );
  }

  return (
    <section className="view">
      <div className="lib-search">
        <Search size={16} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="ابحث في ملفاتك…" />
        {q && <button className="remove pressable" onClick={() => setQ("")} aria-label="مسح"><X size={14} /></button>}
      </div>

      <div className="chip-row">
        {kinds.map(k => (
          <button key={k} className={"chip pressable " + (kind === k ? "on" : "")}
            onClick={() => setKind(k)}>{k === "all" ? "الكل" : KIND_META[k].label}</button>
        ))}
      </div>

      <p className="lib-stats">{filtered.length} ملف{groups.length > 1 ? " · " + groups.length + " مواد" : ""}</p>

      {groups.map(([course, list]) => (
        <div className="lib-group" key={course}>
          <h3>{course}<small>{list.length}</small></h3>
          {list.map(f => {
            const meta = KIND_META[f.kind] || {};
            return (
              <div className="lib-row" key={f.id}>
                <button className="lib-open pressable" onClick={() => (f.video ? api.openVideo(f.url) : api.openFile(f))}>
                  <i className={"lib-icon " + (meta.cls || "")}>{meta.icon || <FileText size={17} />}</i>
                  <span className="lib-info">
                    <span className="file-name">{f.name}</span>
                    <small>{f.video ? "رابط فيديو" : fmtBytes(f.size) || "ملف"}{f.added ? " · " + new Date(f.added).toLocaleDateString("ar-EG", { day: "numeric", month: "short" }) : ""}</small>
                  </span>
                </button>
                <button className="remove pressable" onClick={() => (f.video ? api.videoMenu(f) : api.fileMenu(f))} aria-label="خيارات"><X size={14} /></button>
              </div>
            );
          })}
        </div>
      ))}

      {!filtered.length && <p className="hint" style={{ textAlign: "center", padding: "24px 0" }}>مفيش نتائج للبحث ده.</p>}
    </section>
  );
}
