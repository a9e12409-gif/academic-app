import { BookOpen, CalendarDays, Clock3, FolderOpen } from "lucide-react";

export default function TabBar({ view, onGo, counts, onVibrate }) {
  const items = [
    { id: "daily", label: "اليوم", icon: <Clock3 size={19} /> },
    { id: "courses", label: "المواد", icon: <BookOpen size={19} /> },
    { id: "files", label: "الملفات", icon: <FolderOpen size={19} />, badge: counts.files },
    { id: "exams", label: "الامتحانات", icon: <CalendarDays size={19} />, badge: counts.exams },
  ];
  const idx = Math.max(0, items.findIndex(i => i.id === view));

  return (
    <nav className="tabbar" role="tablist" aria-label="التنقل">
      {items.map(it => (
        <button key={it.id} role="tab" aria-selected={view === it.id}
          className={"tab pressable " + (view === it.id ? "on" : "")}
          onClick={() => { onVibrate?.(); onGo(it.id); }}>
          {it.icon}
          <span>{it.label}</span>
          {!!it.badge && <i className="tab-badge">{it.badge}</i>}
        </button>
      ))}
      <i className="tab-ind" style={{ transform: `translateX(${-idx * 100}%)` }} aria-hidden="true" />
    </nav>
  );
}
