import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, FolderOpen, Search, Settings, X } from "lucide-react";
import Sheet from "./Sheet";
import { useI18n } from "../i18n";
import { allFiles } from "../lib/planner";
import { fmtBytes, norm, fmtDate, fmtTime, keyDate, dateFor } from "../lib/utils";

/* المركز — ثلاث بوابات فقط: الامتحانات، المكتبة، الإعدادات */

export function MenuHub({ data, close, onSelect }) {
  const { t } = useI18n();
  const exams = data.exams.filter(e => e.date >= keyDate(new Date())).length;
  const files = Object.values(data.resources).reduce((n, r) => n + (r.files?.length || 0), 0);
  const items = [
    { id: "exams", icon: <CalendarDays size={18} />, label: t("exams_title"), n: exams },
    { id: "lib", icon: <FolderOpen size={18} />, label: t("lib_title"), n: files },
    { id: "set", icon: <Settings size={18} />, label: t("settings") }
  ];
  return (
    <Sheet title={t("menu_hub")} close={close}>
      <div className="hub-list">
        {items.map(it => (
          <button key={it.id} className="hub-item pressable" onClick={() => { close(); onSelect(it.id); }}>
            <span className="hub-ic">{it.icon}</span>
            <span className="hub-lb">{it.label}</span>
            {!!it.n && <em>{it.n}</em>}
          </button>
        ))}
      </div>
    </Sheet>
  );
}

export function ExamsSheet({ data, close, onJump }) {
  const { t, lang } = useI18n();
  const exams = useMemo(() => [...data.exams].sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || ""))), [data.exams]);
  const Fwd = lang === "ar" ? ChevronLeft : ChevronRight;
  return (
    <Sheet title={t("exams_title")} close={close}>
      {!exams.length
        ? <p className="hint center">{t("no_exams_yet")}</p>
        : exams.map(e => {
          const cd = Math.ceil((new Date(e.date + "T" + (e.time || "00:00")) - Date.now()) / 86400000);
          const past = cd < 0;
          const dayIdx = [...Array(7)].findIndex((_, i) => keyDate(dateFor(i)) === e.date);
          return (
            <div key={e.id} className={"exam-line " + (past ? "past" : "")}>
              <em className={"el-count " + (!past && cd <= 3 ? "soon" : "")}>
                {past ? t("exam_past") : cd === 0 ? t("exam_today") : cd + " " + t("days_left")}
              </em>
              <span className="el-info">
                <strong>{e.courseName}</strong>
                <small>{fmtDate(new Date(e.date + "T12:00:00"), lang, { weekday: "long", day: "numeric", month: "long" })} · {fmtTime(e.time, lang)} · {t("exam_" + e.type)}</small>
              </span>
              {dayIdx >= 0 && !past && (
                <button className="ghost pressable" onClick={() => { close(); onJump(dayIdx, e.id); }}>
                  {t("jump_to_exam")} <Fwd size={13} />
                </button>
              )}
            </div>
          );
        })}
    </Sheet>
  );
}

export function LibrarySheet({ data, api, close }) {
  const { t, lang } = useI18n();
  const [q, setQ] = useState("");
  const files = useMemo(() => allFiles(data), [data]);
  const filtered = files.filter(f => !q.trim() || norm(f.name).includes(norm(q)));
  const groups = useMemo(() => {
    const m = new Map();
    filtered.forEach(f => { if (!m.has(f.courseName)) m.set(f.courseName, []); m.get(f.courseName).push(f); });
    return [...m.entries()];
  }, [filtered]);

  return (
    <Sheet title={t("lib_title")} close={close}>
      <div className="lib-search">
        <Search size={16} aria-hidden="true" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder={t("files_search_ph")} aria-label={t("search")} />
        {q && <button className="icon-x pressable" onClick={() => setQ("")} aria-label={t("aria_clear")}><X size={14} /></button>}
      </div>
      {!files.length
        ? <p className="hint center">{t("files_empty_text")}</p>
        : groups.map(([course, list]) => (
          <div className="lib-group" key={course}>
            <h3>{course}<small>{list.length}</small></h3>
            {list.map(f => (
              <div className="lib-row" key={f.id}>
                <button className="lib-open pressable" onClick={() => (f.video ? api.openVideo(f.url) : api.openFile(f))}>
                  <span className="lib-info">
                    <span className="file-name">{f.video ? t("video_link_name") + " — " + f.courseName : f.name}</span>
                    <small>{f.video ? f.url : fmtBytes(f.size) || ""}{f.added ? " · " + fmtDate(new Date(f.added), lang, { day: "numeric", month: "short" }) : ""}</small>
                  </span>
                </button>
              </div>
            ))}
          </div>
        ))}
      {!!files.length && !filtered.length && <p className="hint center">{t("no_results")}</p>}
    </Sheet>
  );
}
