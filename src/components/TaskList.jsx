import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { useI18n } from "../i18n";

export function QuickTask({ onAdd }) {
  const { t } = useI18n();
  const [v, setV] = useState("");
  const add = () => { if (v.trim()) { onAdd(v); setV(""); } };
  return (
    <div className="quick-task">
      <input value={v} onChange={e => setV(e.target.value)}
        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
        placeholder={t("task_ph")} aria-label={t("station_tasks")} />
      <button className="pressable" onClick={add} disabled={!v.trim()} aria-label={t("add")}><Plus size={15} /></button>
    </div>
  );
}

export function TaskList({ items, add, toggle, remove }) {
  const { t } = useI18n();
  return (
    <div className="tasks">
      <QuickTask onAdd={add} />
      {items.length
        ? items.map(task => (
          <div className={"task " + (task.done ? "done" : "")} key={task.id}>
            <button className="check pressable" onClick={() => toggle(task.id)} role="checkbox" aria-checked={!!task.done} aria-label={task.title}>
              {task.done && <Check size={12} />}
            </button>
            <span>{task.title}</span>
            <button className="remove pressable" onClick={() => remove(task.id)} aria-label={t("delete")}><X size={13} /></button>
          </div>
        ))
        : <p className="hint">{t("tasks_hint")}</p>}
    </div>
  );
}
