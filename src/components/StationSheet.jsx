import { useState } from "react";
import { BookOpen, Pencil, Trash2, X } from "lucide-react";
import Sheet from "./Sheet";
import ActionSheet from "./ActionSheet";
import { TaskList } from "./TaskList";
import { DAYS, TYPES } from "../constants";
import { fmt12Range } from "../lib/utils";

export default function StationSheet({ session, tasks, api, close }) {
  const [confirm, setConfirm] = useState(false);

  return (
    <>
      <Sheet title={session.courseName} close={close}>
        <div className="sum">
          <span className="sum-main">{DAYS[session.day]} · {fmt12Range(session)}</span>
          <span className="sum-tags">
            <small>{TYPES[session.type]}</small>
            {session.room && <small>{session.room}</small>}
          </span>
        </div>

        <TaskList items={tasks} add={t => api.addTask(session.id, t)}
          toggle={api.toggleTask(session.id)} remove={api.removeTask(session.id)} />

        <div className="sheet-actions">
          <button className="ghost pressable" onClick={() => api.editSession(session, close)}><Pencil size={15} /> تعديل</button>
          <button className="ghost pressable" onClick={() => { close(); api.jump(session.courseId); }}><BookOpen size={15} /> المادة</button>
          <button className="ghost danger pressable" onClick={() => setConfirm(true)}><Trash2 size={15} /> حذف</button>
        </div>
      </Sheet>

      {confirm && (
        <ActionSheet title="تحذف الموعد ده؟" close={() => setConfirm(false)} actions={[
          { label: "أيوه، احذفه", icon: <Trash2 size={18} />, danger: true, onClick: () => api.removeSession(session, close) },
          { label: "رجوع", icon: <X size={18} /> },
        ]} />
      )}
    </>
  );
}
