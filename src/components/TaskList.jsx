import { useState } from "react";
import { Check, Plus, X } from "lucide-react";

export function QuickTask({ onAdd, placeholder = "واجب أو ملاحظة سريعة…" }) {
  const [v, setV] = useState("");
  const add = () => { if (v.trim()) { onAdd(v); setV(""); } };
  return (
    <div className="quick-task">
      <input value={v} onChange={e => setV(e.target.value)}
        onKeyDown={e => e.key === "Enter" && add()} placeholder={placeholder} />
      <button className="pressable" onClick={add} disabled={!v.trim()} aria-label="إضافة"><Plus size={15} /></button>
    </div>
  );
}

export function TaskList({ items, add, toggle, remove }) {
  return (
    <div className="tasks">
      <QuickTask onAdd={add} />
      {items.length
        ? items.map(t => (
          <div className={"task " + (t.done ? "done" : "")} key={t.id}>
            <button className="check pressable" onClick={() => toggle(t.id)} role="checkbox" aria-checked={!!t.done} aria-label={t.title}>
              {t.done && <Check size={12} />}
            </button>
            <span>{t.title}</span>
            <button className="remove pressable" onClick={() => remove(t.id)} aria-label="حذف"><X size={13} /></button>
          </div>
        ))
        : <p className="hint">اكتب المطلوب هنا عشان يفضل قدامك.</p>}
    </div>
  );
}
