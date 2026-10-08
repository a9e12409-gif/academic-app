import { useMemo, useState } from "react";
import { CalendarDays, GraduationCap, MapPin, Plus, Search, X } from "lucide-react";
import ExamSheet from "../components/ExamSheet";
import EmptyState from "../components/EmptyState";
import { EXAMS } from "../constants";
import { fmt12, fmtDate, keyDate } from "../lib/utils";

function countdown(e) {
  const dt = new Date(e.date + "T" + (e.time || "00:00"));
  const days = Math.ceil((dt - Date.now()) / 86400000);
  return { days, past: days < 0 };
}

export default function ExamsView({ data, api }) {
  const [examId, setExamId] = useState("");
  const exams = useMemo(() => [...data.exams].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)), [data.exams]);
  const chosen = data.exams.find(e => e.id === examId);

  if (!exams.length) {
    return (
      <EmptyState icon={<CalendarDays />} title="مفيش امتحانات مسجّلة"
        text="سجّل امتحان تحريري أو عملي وهنعدّلك الأيام."
        action={<button className="primary ripple-host pressable" onClick={() => api.newExam()}><Plus size={15} /> أضف امتحان</button>} />
    );
  }

  const upcoming = exams.filter(e => e.date >= keyDate(new Date()));
  const hero = upcoming[0] || exams[exams.length - 1];
  const heroCd = countdown(hero);

  return (
    <section className="view">
      <button className={"exam-hero " + (heroCd.past ? "past" : "")} onClick={() => setExamId(hero.id)}>
        <span className="exam-hero-count">
          {heroCd.past ? "انتهى" : heroCd.days === 0 ? "النهاردة" : <><b>{heroCd.days}</b><small>يوم</small></>}
        </span>
        <div className="exam-hero-info">
          <small>{EXAMS[hero.type]} · {hero.courseName}</small>
          <strong>{fmtDate(new Date(hero.date + "T12:00:00"), { weekday: "long", day: "numeric", month: "long" })}</strong>
          <span>{fmt12(hero.time)}{hero.room ? " · " + hero.room : ""}</span>
        </div>
      </button>

      <div className="exam-rail" role="list" aria-label="كل الامتحانات">
        {exams.map(e => {
          const cd = countdown(e);
          return (
            <button className={"exam-card pressable " + (cd.past ? "past" : "")} role="listitem" key={e.id} onClick={() => setExamId(e.id)}>
              <div className="exam-card-top">
                <strong>{e.courseName}</strong>
                <small className={"exam-count " + (cd.past ? "past" : cd.days <= 7 ? "soon" : "")}>
                  {cd.past ? "انتهى" : cd.days === 0 ? "النهاردة" : cd.days + " يوم"}
                </small>
              </div>
              <span className="exam-card-date">{fmtDate(new Date(e.date + "T12:00:00"), { weekday: "short", day: "numeric", month: "short" })} · {fmt12(e.time)}</span>
              <span className="exam-card-meta">
                <small>{EXAMS[e.type]}</small>
                {e.room && <small><MapPin size={11} /> {e.room}</small>}
                {e.seating && <small><GraduationCap size={11} /> {e.seating}</small>}
              </span>
            </button>
          );
        })}
      </div>

      {chosen && <ExamSheet exam={chosen} api={api} close={() => setExamId("")} />}
    </section>
  );
}
