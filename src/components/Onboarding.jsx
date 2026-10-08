import { useState } from "react";
import { ArrowLeft, Bell, Check, Clock3, Moon, Plus, Sun, X } from "lucide-react";
import { DAYS } from "../constants";
import { fmt12, today } from "../lib/utils";

export default function Onboarding({ hasData, theme, setTheme, onFinish }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [notify, setNotify] = useState(false);
  const [list, setList] = useState([]);
  const [f, setF] = useState({ name: "", day: today(), start: "09:00" });
  const set = p => setF(o => ({ ...o, ...p }));

  const askNotify = async on => {
    if (!on) { setNotify(false); return; }
    if (!("Notification" in window)) return;
    try { setNotify(await Notification.requestPermission() === "granted"); }
    catch { setNotify(false); }
  };

  const addOne = () => {
    if (!f.name.trim()) return;
    setList(l => [...l, { name: f.name.trim(), day: f.day, start: f.start, type: "lecture", duration: 90, room: "" }]);
    setF({ name: "", day: f.day, start: f.start });
  };

  const finish = () => onFinish({ name: name.trim(), theme, notify, sessions: list });

  return (
    <div className="ob" key={step}>
      <div className="ob-art" aria-hidden="true">
        <i /><i /><i /><b className="ob-train" />
      </div>

      <div className="ob-steps" aria-label={`خطوة ${step + 1} من 3`}>
        <i className={step === 0 ? "on" : ""} /><i className={step === 1 ? "on" : ""} /><i className={step === 2 ? "on" : ""} />
      </div>

      {step === 0 && (
        <div className="ob-step">
          <h1>أهلاً بيك في ترمك</h1>
          <p>مساحة صغيرة تنظّم محاضراتك وملفاتك وامتحاناتك — كل حاجة على جهازك بس.</p>
          <label className="ob-field">
            <span>نعرفك باسمك؟</span>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="اسمك" autoFocus
              onKeyDown={e => { if (e.key === "Enter") setStep(1); }} />
          </label>
          <button className="primary ob-next pressable" onClick={() => setStep(1)}>
            <span>يلا نبدأ</span><ArrowLeft size={16} />
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="ob-step">
          <h1>اختار شكل المساحة</h1>
          <p>تقدر تغيّره في أي وقت من فوق.</p>
          <div className="ob-cards">
            <button className={"ob-card " + (theme === "light" ? "on" : "")} onClick={() => setTheme("light")}>
              <Sun size={22} /><span>فاتح</span>{theme === "light" && <Check size={15} />}
            </button>
            <button className={"ob-card dark " + (theme === "dark" ? "on" : "")} onClick={() => setTheme("dark")}>
              <Moon size={22} /><span>داكن</span>{theme === "dark" && <Check size={15} />}
            </button>
          </div>
          <button className={"ob-card wide " + (notify ? "on" : "")} onClick={() => askNotify(!notify)}>
            <Bell size={20} />
            <span>نبّهني قبل المحاضرة بربع ساعة</span>
            <i className={"switch " + (notify ? "on" : "")} />
          </button>
          <button className="primary ob-next pressable" onClick={() => setStep(2)}>
            <span>كمّل</span><ArrowLeft size={16} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="ob-step">
          <h1>{hasData ? "جاهز!" : "أوّل مواعيدك"}</h1>
          {!hasData && <>
            <p>سجّل محاضراتك الأسبوعية — تقدر تضيف الباقي من جوه في أي وقت.</p>
            <div className="ob-quick">
              <input value={f.name} onChange={e => set({ name: e.target.value })} placeholder="اسم المادة" />
              <div className="ob-days">
                {DAYS.map((d, i) => (
                  <button key={d} className={"chip pressable " + (f.day === i ? "on" : "")} onClick={() => set({ day: i })}>{d}</button>
                ))}
              </div>
              <div className="ob-time">
                <Clock3 size={15} />
                <input type="time" value={f.start} onChange={e => set({ start: e.target.value || "09:00" })} />
                <button className="ob-add pressable" onClick={addOne} disabled={!f.name.trim()} aria-label="أضف"><Plus size={16} /></button>
              </div>
            </div>
            {!!list.length && (
              <ul className="ob-list">
                {list.slice(0, 3).map((s, i) => (
                  <li key={i}>
                    <button className="remove pressable" onClick={() => setList(l => l.filter((_, j) => j !== i))} aria-label="حذف"><X size={12} /></button>
                    <span>{s.name}</span>
                    <small>{DAYS[s.day]} · {fmt12(s.start)}</small>
                  </li>
                ))}
                {list.length > 3 && <li className="more">+{list.length - 3} كمان</li>}
              </ul>
            )}
          </>}
          {hasData && <p>موادك ومواعيدك موجودة وهتلاقيها مستنية.</p>}
          <button className="primary ob-next pressable" onClick={finish}>
            <span>{list.length ? "ابدأ الترم" : "دخول"}</span><ArrowLeft size={16} />
          </button>
          {step === 2 && !list.length && !hasData &&
            <button className="plain ob-skip pressable" onClick={finish}>ابدأ فاضي</button>}
        </div>
      )}
    </div>
  );
}
