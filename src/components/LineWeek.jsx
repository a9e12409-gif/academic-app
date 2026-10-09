import { useEffect, useMemo, useRef, useState } from "react";
import { Diamond, MapPin, Pencil, Trash2 } from "lucide-react";
import { useI18n } from "../i18n";
import { LINE_H0, LINE_H1, LINE_PXH, PALETTE } from "../constants";
import { mins, dur, fmtTime, fmtRange, dateFor, fmtDate, keyDate, today, relTime } from "../lib/utils";
import SessionDetail from "./SessionDetail";

export const colorOf = (courses, courseId) => {
  const i = courses.findIndex(c => c.id === courseId);
  return PALETTE[(i < 0 ? 0 : i) % PALETTE.length];
};

const H = (LINE_H1 - LINE_H0) * LINE_PXH;
const yOf = m => (m / 60 - LINE_H0) * LINE_PXH;

/* ============================================================
   الخَط — الأسبوع كله سطح واحد متصل.
   اليوم المُركَّز عليه يُرسم بمقياس زمني حقيقي (كل ساعة = ٦٨بكسل)،
   وباقي الأيام أشرطة مضغوطة تُفتح بلمسة.
   لمس أي فجوة فارغة = إنشاء محطة في مكانها وزمانها.
   ============================================================ */

export default function LineWeek({ data, api, now, focusDay, setFocusDay, expanded, setExpanded, openComposer, highlight, reveal }) {
  const { t, lang } = useI18n();
  const gridRef = useRef(null);
  const beamRef = useRef(null);
  const isTodayFocus = focusDay === today();
  const nowM = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  const daySessions = useMemo(
    () => data.sessions.filter(s => +s.day === focusDay).sort((a, b) => a.start.localeCompare(b.start)),
    [data.sessions, focusDay]
  );
  const dayKey = keyDate(dateFor(focusDay));
  const dayExams = useMemo(
    () => data.exams.filter(e => e.date === dayKey).sort((a, b) => (a.time || "").localeCompare(b.time || "")),
    [data.exams, dayKey]
  );

  // كشف التداخل لتقسيم المسارات
  const lanes = useMemo(() => {
    const L = {};
    daySessions.forEach((s, i) => {
      const clash = daySessions.slice(0, i).some(p =>
        Math.max(mins(p.start), mins(s.start)) < Math.min(mins(p.start) + dur(p), mins(s.start) + dur(s)));
      L[s.id] = clash ? 1 : 0;
    });
    return { map: L, split: Object.values(L).some(v => v === 1) };
  }, [daySessions]);

  // عند التركيز على اليوم الحالي: اجعل الشعاع في منتصف المشهد مرة واحدة
  useEffect(() => {
    if (isTodayFocus && beamRef.current) beamRef.current.scrollIntoView({ block: "center" });
  }, [isTodayFocus]); // eslint-disable-line

  const onGridClick = e => {
    if (e.target.closest(".stop, .exam-flag, .coach, .beam")) return;
    const rect = gridRef.current.getBoundingClientRect();
    let h = LINE_H0 + (e.clientY - rect.top) / LINE_PXH;
    h = Math.max(LINE_H0, Math.min(LINE_H1 - 0.5, Math.round(h * 2) / 2));
    const start = String(Math.floor(h)).padStart(2, "0") + ":" + (h % 1 ? "30" : "00");
    openComposer({ day: focusDay, start });
  };

  const hours = [];
  for (let h = LINE_H0; h <= LINE_H1; h++) hours.push(h);

  return (
    <div className="week">
      {[...Array(7)].map((_, i) => i === focusDay ? (

        /* ————— اليوم المُركَّز ————— */
        <section key={"f" + i} className="wk-focus">
          <header className="wk-head">
            <h2>{fmtDate(dateFor(i), lang, { weekday: "long", day: "numeric", month: "long" })}</h2>
            {isTodayFocus && <span className="wk-today-tag">{t("today_dot")}</span>}
          </header>

          <div className="line-grid" style={{ height: H }} onClick={onGridClick} ref={gridRef}>
            <i className="rail" aria-hidden="true" />
            {hours.map(h => (
              <div key={h} className="tick" style={{ top: yOf(h * 60) }}>
                <span className="tick-lb">{String(h).padStart(2, "0")}</span>
              </div>
            ))}

            {isTodayFocus && nowM / 60 >= LINE_H0 && nowM / 60 <= LINE_H1 && (
              <div className="beam" style={{ top: yOf(nowM) }} ref={beamRef}>
                <i /><span>{t("jump_now")}</span>
              </div>
            )}

            {dayExams.map(e => {
              const cd = Math.ceil((new Date(e.date + "T" + (e.time || "00:00")) - Date.now()) / 86400000);
              const open = expanded === "e:" + e.id;
              return (
                <div key={e.id} className={"exam-flag stop-zone " + (open ? "open" : "")}
                  style={{ top: yOf(mins(e.time || "09:00")) }}
                  id={"exam-" + e.id}>
                  <div className="exam-flag-head" role="button" tabIndex={0}
                    onClick={() => setExpanded(open ? "" : "e:" + e.id)}
                    onKeyDown={ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); setExpanded(open ? "" : "e:" + e.id); } }}>
                    <Diamond size={14} className="exam-dia" />
                    <strong>{e.courseName}</strong>
                    <small>{t("exam_" + e.type)} · {fmtTime(e.time, lang)}</small>
                    <em>{cd <= 0 ? t("exam_today") : cd + " " + t("days_left")}</em>
                  </div>
                  {open && <ExamDetail exam={e} api={api} onEdit={() => openComposer({ initialExam: e })} />}
                </div>
              );
            })}

            {daySessions.map(s => {
              const open = expanded === s.id;
              const st = mins(s.start), en = st + dur(s);
              const state = !isTodayFocus ? "idle" : nowM >= en ? "past" : nowM >= st ? "live" : "next";
              const c = colorOf(data.courses, s.courseId);
              const lane = lanes.map[s.id] || 0;
              const style = {
                top: yOf(st),
                minHeight: Math.max(56, yOf(en) - yOf(st)),
                "--sc": c,
                ...(lanes.split ? (lane
                  ? { insetInlineStart: "calc(60px + (100% - 60px) * .505)", width: "calc((100% - 60px) * .495)" }
                  : { width: "calc((100% - 60px) * .495)" }) : {})
              };
              const dim = highlight && highlight !== s.courseId;
              return (
                <div key={s.id} id={"stop-" + s.id}
                  className={"stop stop-zone " + state + (open ? " open" : "") + (dim ? " dim" : "")}
                  style={style} role="button" tabIndex={0}
                  onClick={() => setExpanded(open ? "" : s.id)}
                  onKeyDown={ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); setExpanded(open ? "" : s.id); } }}>
                  <div className="stop-head">
                    <span className="stop-time">{fmtRange(s, lang)}</span>
                    <span className="stop-name">{s.courseName}</span>
                    <span className="stop-sub">
                      {t("type_" + s.type)}{s.room && <><i aria-hidden="true" /><MapPin size={11} /> {s.room}</>}
                    </span>
                    {state === "live" && (
                      <span className="stop-live-bar" aria-hidden="true">
                        <i style={{ width: (Math.min(1, (nowM - st) / dur(s)) * 100).toFixed(1) + "%" }} />
                      </span>
                    )}
                    {state === "next" && <em className="stop-rel">{relTime(st - nowM, lang)}</em>}
                  </div>
                  {open && <SessionDetail session={s} data={data} api={api}
                    onEdit={() => openComposer({ initial: s })} />}
                </div>
              );
            })}

            {!daySessions.length && !dayExams.length && (
              <div className="coach">
                <p>{t("coach_x")}</p>
                <button className="coach-btn pressable" onClick={e => { e.stopPropagation(); openComposer({ day: focusDay, start: "09:00" }); }}>
                  + {t("add_stop")}
                </button>
              </div>
            )}
          </div>
        </section>
      ) : (

        /* ————— يوم مضغوط ————— */
        (() => {
          const ss = data.sessions.filter(s => +s.day === i);
          const ex = data.exams.filter(e => e.date === keyDate(dateFor(i)));
          const d = dateFor(i);
          return (
            <button key={"s" + i} className={"wk-strip" + (i === today() ? " is-today" : "")}
              onClick={() => setFocusDay(i)} aria-label={fmtDate(d, lang, { weekday: "long", day: "numeric", month: "long" })}>
              <span className="strip-day">
                <b>{fmtDate(d, lang, { weekday: "short" })}</b>
                <small>{d.getDate()}</small>
              </span>
              <span className="strip-track" dir="ltr" aria-hidden="true">
                {ss.map(s => (
                  <i key={s.id} className="strip-bar" style={{
                    left: ((mins(s.start) / 60 - LINE_H0) / (LINE_H1 - LINE_H0) * 100) + "%",
                    width: Math.max(2.5, dur(s) / 60 / (LINE_H1 - LINE_H0) * 100) + "%",
                    background: colorOf(data.courses, s.courseId)
                  }} />
                ))}
                {ex.map(e => (
                  <i key={e.id} className="strip-dia" style={{
                    left: (((mins(e.time || "09:00")) / 60 - LINE_H0) / (LINE_H1 - LINE_H0) * 100) + "%"
                  }} />
                ))}
              </span>
              <span className="strip-end">
                {ex.length > 0 && <em className="strip-exam"><Diamond size={10} /> {ex.length}</em>}
                <small>{ss.length ? (ss.length === 1 ? "1 " + t("one_stop") : ss.length + " " + t("stops_n")) : "—"}</small>
              </span>
            </button>
          );
        })()
      ))}
    </div>
  );
}

function ExamDetail({ exam, api, onEdit }) {
  const { t } = useI18n();
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="stop-body">
      <p className="detail-line">
        <strong>{t("exam_flag")}</strong> · {t("exam_" + exam.type)}
        {exam.room && <> · <MapPin size={12} /> {exam.room}</>}
      </p>
      <div className="detail-actions">
        <button className="ghost pressable" onClick={onEdit}><Pencil size={14} /> {t("edit")}</button>
        {!confirm
          ? <button className="ghost danger pressable" onClick={() => setConfirm(true)}><Trash2 size={14} /> {t("delete")}</button>
          : <span className="confirm-row">
              <button className="ghost danger solid pressable" onClick={() => { setConfirm(false); api.removeExam(exam.id); }}>{t("delete")}</button>
              <button className="ghost pressable" onClick={() => setConfirm(false)}>{t("cancel")}</button>
            </span>}
      </div>
    </div>
  );
}
