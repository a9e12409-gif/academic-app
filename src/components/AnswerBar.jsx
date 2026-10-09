import { Menu, Plus } from "lucide-react";
import { useI18n } from "../i18n";
import { useNow } from "../hooks/useNow";
import { mins, dur, fmtTime, today } from "../lib/utils";

/* ============================================================
   شريط الإجابة — الهوية النابضة للتطبيق.
   يجيب عن سؤال الطالب الوحيد في لمحة: إيه اللي حاصل وإيه الجاي؟
   ============================================================ */

export default function AnswerBar({ data, onOpenSession, onAdd, onMenu, onJumpNow }) {
  const { t, lang } = useI18n();
  const now = useNow(1000);
  const ix = today();
  const nowM = now.getHours() * 60 + now.getMinutes();

  const todays = data.sessions.filter(s => +s.day === ix).sort((a, b) => a.start.localeCompare(b.start));
  const live = todays.find(s => nowM >= mins(s.start) && nowM < mins(s.start) + dur(s));
  const next = !live ? todays.find(s => nowM < mins(s.start)) : null;

  let kicker, big, sub, color;
  if (live) {
    const left = mins(live.start) + dur(live) - nowM;
    const ss = left * 60 - now.getSeconds();
    kicker = t("hud_live");
    big = String(Math.max(0, Math.floor(ss / 60))).padStart(2, "0") + ":" + String(Math.max(0, ss % 60)).padStart(2, "0");
    sub = live.courseName + (live.room ? " · " + live.room : "");
    color = live;
  } else if (next) {
    kicker = t("hud_next");
    big = fmtTime(next.start, lang);
    sub = next.courseName + (next.room ? " · " + next.room : "");
    color = next;
  } else if (todays.length) {
    kicker = t("hud_done");
    big = "✓";
    sub = t("hud_done_x");
  } else {
    kicker = t("hud_empty");
    big = "+";
    sub = t("hud_empty_x");
  }

  const target = live || next;

  return (
    <header className="hud">
      <div className="hud-core">
        <p className="hud-kicker">
          {target && <i className="hud-dot" aria-hidden="true" />}
          {kicker}
        </p>
        <button className={"hud-big pressable " + (target ? "link" : "ghosty")}
          onClick={() => (target ? (onOpenSession(target), onJumpNow()) : onAdd())}
          aria-label={target ? sub : t("add_stop")}>
          {big}
        </button>
        <p className="hud-sub">{sub}</p>
      </div>
      <div className="hud-actions">
        <button className="hud-btn pressable" onClick={onJumpNow} aria-label={t("jump_now")}>
          <span className="hud-now-pill">{t("jump_now")}</span>
        </button>
        <button className="hud-btn round accent pressable" onClick={onAdd} aria-label={t("add_stop")}><Plus size={20} /></button>
        <button className="hud-btn round pressable" onClick={onMenu} aria-label={t("menu_hub")}><Menu size={19} /></button>
      </div>
    </header>
  );
}
