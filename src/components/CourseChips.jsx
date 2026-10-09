import { useState } from "react";
import { MessageCircle, Trash2 } from "lucide-react";
import { useI18n } from "../i18n";
import { colorOf } from "./LineWeek";

/* شريط الخطوط: كل مادة = لون على الخط. لمسة = إبراز، لمسة ثانية = لوحة أوامر */

export default function CourseChips({ data, api, highlight, setHighlight }) {
  const { t } = useI18n();
  const [panel, setPanel] = useState("");
  const [name, setName] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [whats, setWhats] = useState("");

  if (!data.courses.length) return null;

  const tap = c => {
    if (highlight === c.id && panel === c.id) { setPanel(""); setHighlight(""); return; }
    if (highlight === c.id) { setPanel(c.id); setName(c.name); setWhats(c.whatsapp || ""); setConfirm(false); return; }
    setPanel(""); setConfirm(false); setHighlight(c.id);
  };
  const active = data.courses.find(c => c.id === panel);

  return (
    <div className="lines-block">
      <div className="chips-line" role="group" aria-label={t("lines_lbl")}>
        {data.courses.map(c => (
          <button key={c.id} className={"line-chip pressable " + (highlight === c.id ? "on" : "")}
            style={{ "--lc": colorOf(data.courses, c.id) }}
            aria-pressed={highlight === c.id} onClick={() => tap(c)}>
            <i aria-hidden="true" />{c.name}
          </button>
        ))}
      </div>

      {active && (
        <div className="line-panel">
          <div className="lp-head">
            <i style={{ background: colorOf(data.courses, active.id) }} aria-hidden="true" />
            <input value={name} onChange={e => setName(e.target.value)} aria-label={t("rename_ph")}
              onKeyDown={e => { if (e.key === "Enter" && name.trim() && name.trim() !== active.name) api.renameCourse(active.id, name); }} />
            <button className="ghost pressable" disabled={!name.trim() || name.trim() === active.name}
              onClick={() => api.renameCourse(active.id, name)}>{t("save")}</button>
          </div>
          <div className="lp-row">
            <div className="lp-whats">
              <input dir="ltr" value={whats} onChange={e => setWhats(e.target.value)} placeholder={t("whatsapp_ph")} aria-label={t("whatsapp_link")} />
              {whats.trim()
                ? <button className="ghost pressable" onClick={() => api.saveWhats(active.id, whats.trim())}>{t("save")}</button>
                : <button className="ghost pressable" disabled>{t("save")}</button>}
              {active.whatsapp && (
                <button className="whatsapp pressable" onClick={() => api.openWhats(active)}><MessageCircle size={14} /> {t("open")}</button>
              )}
            </div>
          </div>
          <div className="lp-actions">
            {!confirm
              ? <button className="ghost danger pressable" onClick={() => setConfirm(true)}><Trash2 size={14} /> {t("delete")}</button>
              : <span className="confirm-row">
                  <button className="ghost danger solid pressable" onClick={() => { setPanel(""); setHighlight(""); api.removeCourse(active); }}>{t("delete")}</button>
                  <button className="ghost pressable" onClick={() => setConfirm(false)}>{t("cancel")}</button>
                </span>}
          </div>
        </div>
      )}
    </div>
  );
}
