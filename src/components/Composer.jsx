import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import Sheet from "./Sheet";
import { TYPES, EXAM_TYPES, DURATIONS } from "../constants";
import { useI18n } from "../i18n";
import { findClash, keyDate, fmtDate, dateFor } from "../lib/utils";

/* ============================================================
   الكونسول — أداة إنشاء/تعديل واحدة للحصص والامتحانات.
   تُفتح مهيأة من السياق الذي جئت منه (اليوم والوقت معلومان سلفًا).
   ============================================================ */

export default function Composer({ draft, sessions, close, api }) {
  const { t, lang } = useI18n();
  const initial = draft.initial;            // حصة قيد التعديل
  const initialExam = draft.initialExam;     // امتحان قيد التعديل
  const editing = !!initial || !!initialExam;
  const [mode, setMode] = useState(initialExam ? "exam" : initial ? "class" : draft.exam ? "exam" : "class");

  const [f, setF] = useState(() => ({
    name: initial?.courseName || initialExam?.courseName || "",
    day: initial?.day ?? draft.day ?? new Date().getDay(),
    start: initial?.start || draft.start || "09:00",
    duration: initial?.duration || 90,
    type: initial?.type || "lecture",
    examType: initialExam?.type || "written",
    date: initialExam?.date || draft.date || keyDate(new Date()),
    time: initialExam?.time || "09:00",
    room: initial?.room || initialExam?.room || ""
  }));
  const set = p => setF(o => ({ ...o, ...p }));

  const valid = f.name.trim().length > 0 && (mode === "class" || (f.date && f.time));
  const clash = mode === "class" && !initialExam
    ? findClash(sessions || [], f.day, f.start, f.duration, initial?.id) : null;

  const submit = () => {
    if (!valid) return;
    if (mode === "class") api.saveSession(f, initial);
    else api.saveExam({ ...f, type: f.examType }, initialExam);
    close();
  };

  const days = [...Array(7)].map((_, i) => ({ i, lb: fmtDate(dateFor(i), lang, { weekday: "short" }) }));

  return (
    <Sheet title={editing ? t("edit_stop") : t("add_stop")} close={close}
      footer={
        <button className="save-btn pressable" disabled={!valid} onClick={submit}>
          {t("save")}
        </button>
      }>
      <div className="comp">
        {!editing && (
          <div className="comp-seg" role="radiogroup" aria-label={t("form_type")}>
            {[["class", t("seg_class")], ["exam", t("seg_exam")]].map(([v, lb]) => (
              <button key={v} role="radio" aria-checked={mode === v}
                className={"pressable " + (mode === v ? "on" : "")} onClick={() => setMode(v)}>{lb}</button>
            ))}
          </div>
        )}

        <input className="comp-name" value={f.name} autoFocus
          onChange={e => set({ name: e.target.value })}
          onKeyDown={e => { if (e.key === "Enter" && valid) submit(); }}
          placeholder={t("comp_name_ph")} aria-label={t("course_name")} />

        {mode === "class" ? (
          <>
            <div className="comp-days" role="radiogroup" aria-label={t("form_day")}>
              {days.map(d => (
                <button key={d.i} role="radio" aria-checked={f.day === d.i}
                  className={"pressable " + (f.day === d.i ? "on" : "")} onClick={() => set({ day: d.i })}>{d.lb}</button>
              ))}
            </div>
            <div className="comp-row">
              <input type="time" className="comp-time" value={f.start} aria-label={t("time_label")}
                onChange={e => set({ start: e.target.value || "09:00" })} />
              <div className="comp-durs" role="radiogroup" aria-label={t("form_duration")}>
                {DURATIONS.map(d => (
                  <button key={d} role="radio" aria-checked={f.duration === d}
                    className={"pressable " + (f.duration === d ? "on" : "")} onClick={() => set({ duration: d })}>
                    {d + " " + t("dur_min")}
                  </button>
                ))}
              </div>
            </div>
            {clash && (
              <p className="warn-line" role="alert">
                <AlertTriangle size={14} /> {t("conflict_warn")} «{clash.courseName}»
              </p>
            )}
          </>
        ) : (
          <>
            <div className="comp-row">
              <input type="date" className="comp-time" value={f.date} aria-label={t("date_label")}
                onChange={e => set({ date: e.target.value })} />
              <input type="time" className="comp-time" value={f.time} aria-label={t("time_label")}
                onChange={e => set({ time: e.target.value || "09:00" })} />
            </div>
            <div className="comp-durs" role="radiogroup" aria-label={t("exam_type")}>
              {EXAM_TYPES.map(v => (
                <button key={v} role="radio" aria-checked={f.examType === v}
                  className={"pressable " + (f.examType === v ? "on" : "")} onClick={() => set({ examType: v })}>
                  {t("exam_" + v)}
                </button>
              ))}
            </div>
          </>
        )}

        <input className="comp-room" value={f.room} onChange={e => set({ room: e.target.value })}
          placeholder={t("comp_room_ph")} aria-label={t("room_label")} />
      </div>
    </Sheet>
  );
}
