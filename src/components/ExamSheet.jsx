import { useState } from "react";
import { GraduationCap, MapPin, Pencil, Trash2, X } from "lucide-react";
import Sheet from "./Sheet";
import ActionSheet from "./ActionSheet";
import { EXAMS } from "../constants";
import { fmt12, fmtDate } from "../lib/utils";

export default function ExamSheet({ exam, api, close }) {
  const [confirm, setConfirm] = useState(false);
  const dt = new Date(exam.date + "T" + (exam.time || "00:00"));
  const days = Math.ceil((dt - Date.now()) / 86400000);
  const past = days < 0;

  return (
    <>
      <Sheet title={exam.courseName} close={close}>
        <div className={"exam-hero " + (past ? "past" : "")}>
          <span className="exam-hero-count">
            {past ? "انتهى" : days === 0 ? "النهاردة" : <><b>{days}</b><small>يوم</small></>}
          </span>
          <div>
            <small>{EXAMS[exam.type]}</small>
            <strong>{fmtDate(dt, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</strong>
            <span>{fmt12(exam.time)}</span>
          </div>
        </div>

        <div className="sum-tags">
          {exam.room && <small><MapPin size={12} /> {exam.room}</small>}
          {exam.seating && <small><GraduationCap size={12} /> جلوس {exam.seating}</small>}
        </div>

        <div className="sheet-actions">
          <button className="ghost pressable" onClick={() => api.editExam(exam, close)}><Pencil size={15} /> تعديل</button>
          <button className="ghost danger pressable" onClick={() => setConfirm(true)}><Trash2 size={15} /> حذف</button>
        </div>
      </Sheet>

      {confirm && (
        <ActionSheet title="تحذف موعد الامتحان؟" close={() => setConfirm(false)} actions={[
          { label: "أيوه، احذفه", icon: <Trash2 size={18} />, danger: true, onClick: () => api.removeExam(exam.id) },
          { label: "رجوع", icon: <X size={18} /> },
        ]} />
      )}
    </>
  );
}
