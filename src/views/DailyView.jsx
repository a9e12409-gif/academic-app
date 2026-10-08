import { useMemo, useState } from "react";
import { Clock3, Plus } from "lucide-react";
import MetroLine from "../components/MetroLine";
import HeroNext from "../components/HeroNext";
import StationSheet from "../components/StationSheet";
import EmptyState from "../components/EmptyState";
import { DAYS } from "../constants";
import { useNow } from "../hooks/useNow";
import { mins, dur, today } from "../lib/utils";

export default function DailyView({ data, day, setDay, api }) {
  const now = useNow(30000);
  const [station, setStation] = useState(null);
  const isToday = day === today();

  const sessions = useMemo(
    () => data.sessions.filter(s => +s.day === day).sort((a, b) => a.start.localeCompare(b.start)),
    [data.sessions, day]
  );

  const nowM = now.getHours() * 60 + now.getMinutes();
  const nextUp = isToday ? sessions.find(s => nowM < mins(s.start) + dur(s)) : null;

  return (
    <section className="view">
      <div className="daybar">
        <div className="days">
          {DAYS.map((d, i) => (
            <button key={d} className={"day-chip pressable " + (day === i ? "on" : "")}
              aria-pressed={day === i} onClick={() => setDay(i)}>
              {i === today() && <i className="today-dot" aria-label="النهاردة" />}
              {d}
            </button>
          ))}
        </div>
      </div>

      {!sessions.length ? (
        <EmptyState icon={<Clock3 />} title="اليوم ده فاضي"
          text="أضف محاضرة أو معمل وهيتسجّل المادة لوحدها."
          action={<button className="primary ripple-host pressable" onClick={() => api.newSession(day)}><Plus size={15} /> أضف موعد</button>} />
      ) : (
        <>
          {nextUp && <HeroNext session={nextUp} now={now} onOpen={() => setStation(nextUp)} />}
          <div className="metro-wrap">
            <MetroLine sessions={sessions} now={now} isToday={isToday} onPick={setStation} />
          </div>
          <p className="footnote">دوس على أي محطة تشوف تفاصيلها.</p>
        </>
      )}

      {station && (
        <StationSheet session={station} close={() => setStation(null)}
          tasks={data.tasks[station.id] || []} api={api} />
      )}
    </section>
  );
}
