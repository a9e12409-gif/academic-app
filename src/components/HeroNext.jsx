import { memo } from "react";
import { MapPin, Radio } from "lucide-react";
import { TYPES } from "../constants";
import { mins, dur, endOf, fmt12, clamp, relTime } from "../lib/utils";

function HeroNext({ session, now, onOpen }) {
  const start = mins(session.start), d = dur(session), en = start + d;
  const cur = now.getHours() * 60 + now.getMinutes();
  const live = cur >= start && cur < en;
  const progress = live ? clamp((cur - start) / d, 0, 1) : cur < start ? 0 : 1;
  const remaining = Math.max(0, en - cur);
  const until = Math.max(0, start - cur);
  const C = 2 * Math.PI * 24;

  return (
    <button className="hero pressable" onClick={onOpen}>
      <span className="hero-ring-wrap">
        <svg className="hero-ring" viewBox="0 0 56 56" aria-hidden="true">
          <circle className="hero-ring-bg" cx="28" cy="28" r="24" />
          <circle className="hero-ring-fg" cx="28" cy="28" r="24"
            strokeDasharray={C} strokeDashoffset={C * progress}
            style={{ transition: "stroke-dashoffset .6s ease" }} />
        </svg>
        <span className="hero-ring-label">
          {live
            ? <><b>{remaining}</b><small>دقيقة</small></>
            : <b className="hero-clock">{fmt12(session.start)}</b>}
        </span>
      </span>
      <div className="hero-info">
        <small className="hero-kicker">
          {live ? <><Radio size={12} /> شغالة دلوقتي — {relTime(-remaining)}</> : "الجاية " + relTime(until)}
        </small>
        <strong>{session.courseName}</strong>
        <span className="hero-meta">
          {TYPES[session.type]}
          {session.room ? <><i /><MapPin size={12} />{session.room}</> : null}
        </span>
      </div>
      <span className="hero-end">
        <small>ينتهي</small>
        <b>{fmt12(endOf(session))}</b>
      </span>
    </button>
  );
}

export default memo(HeroNext);
