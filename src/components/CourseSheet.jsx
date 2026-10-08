import { useState } from "react";
import { ChevronDown, FilePlus2, FolderOpen, Link2, MessageCircle, Pencil, Plus, Trash2, Video, X } from "lucide-react";
import Sheet from "./Sheet";
import ActionSheet from "./ActionSheet";
import { TaskList } from "./TaskList";
import { DAYS, TYPES } from "../constants";
import { fmt12Range, fmtBytes, fmtDate } from "../lib/utils";

function SessionTools({ session, data, api }) {
  const [tab, setTab] = useState("files");
  const r = data.resources[session.id] || {};
  const files = r.files || [];
  const tasks = data.tasks[session.id] || [];

  return (
    <div className="session-tools">
      <div className="tool-tabs" role="tablist">
        {[["files", "ملفات"], ["tasks", "تكليفات"], ["notes", "ملاحظات"]].map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id}
            className={"pressable " + (tab === id ? "on" : "")} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === "files" && (
        <>
          <div className="tool-row">
            <b><FolderOpen size={15} /> ملفات المذاكرة</b>
            <label className="outline pressable">
              <FilePlus2 size={14} /> إرفاق
              <input type="file" multiple accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.png,.xlsx"
                onChange={e => { api.attach(session, e.target.files); e.target.value = ""; }} />
            </label>
          </div>
          {files.length
            ? files.map(f => (
              <div className="file-row" key={f.id}>
                <button className="pressable" onClick={() => api.openFile(f)}>
                  <FilePlus2 size={14} />
                  <span className="file-name">{f.name}</span>
                  {f.size ? <small>{fmtBytes(f.size)}</small> : null}
                </button>
                <button className="remove pressable" onClick={() => api.fileMenu(session, f)} aria-label="خيارات"><X size={13} /></button>
              </div>
            ))
            : <p className="hint">اربط ملفات المحاضرة هنا.</p>}
          <div className="tool-row">
            <b><Video size={15} /> شرح مرئي</b>
            <div className="video-input">
              <input dir="ltr" value={r.videoUrl || ""} placeholder="الصق رابط الفيديو"
                onChange={e => api.setVideo(session.id, e.target.value)} />
              <button disabled={!r.videoUrl} onClick={() => api.openVideo(r.videoUrl)} aria-label="فتح"><Link2 size={14} /></button>
            </div>
          </div>
        </>
      )}

      {tab === "tasks" && (
        <TaskList items={tasks} add={t => api.addTask(session.id, t)}
          toggle={api.toggleTask(session.id)} remove={api.removeTask(session.id)} />
      )}

      {tab === "notes" && (
        <textarea rows="3" value={data.notes[session.id] || ""} placeholder="اكتب ملاحظة عن الحصة…"
          onChange={e => api.setNotes(session.id, e.target.value)} />
      )}
    </div>
  );
}

export default function CourseSheet({ course, data, api, close }) {
  const [open, setOpen] = useState("");
  const [confirm, setConfirm] = useState(false);
  const sessions = data.sessions.filter(s => s.courseId === course.id)
    .sort((a, b) => a.day - b.day || a.start.localeCompare(b.start));

  return (
    <>
      <Sheet title={course.name} close={close}>
        <div className="whats-row">
          <button className="whatsapp pressable" onClick={() => api.openWhats(course)}>
            <MessageCircle size={15} /> مجموعة المادة
          </button>
          <button className="ghost pressable" onClick={() => api.editCourse(course, close)}><Pencil size={14} /> تعديل</button>
          <button className="ghost danger pressable" onClick={() => setConfirm(true)}><Trash2 size={14} /> حذف</button>
        </div>

        <div className="list-head"><b>مواعيد المادة</b><span>{sessions.length} لقاء أسبوعي</span></div>
        {!sessions.length
          ? <div className="no-sessions">
              <span>مفيش مواعيد للمادة دي.</span>
              <button className="plain pressable" onClick={() => api.newSessionFor(course.id, close)}><Plus size={14} /> أضف موعد</button>
            </div>
          : sessions.map(s => (
            <div className="course-session" key={s.id}>
              <button className="session-toggle pressable" onClick={() => setOpen(o => (o === s.id ? "" : s.id))}
                aria-expanded={open === s.id}>
                <i className={"dot " + (s.type === "lab" ? "mint" : "")} />
                <span>{TYPES[s.type]} <small>{DAYS[s.day]} · {fmt12Range(s)}</small></span>
                <em>{s.room || "بدون قاعة"}</em>
                <ChevronDown size={15} className={open === s.id ? "rot" : ""} />
              </button>
              {open === s.id && <SessionTools session={s} data={data} api={api} />}
            </div>
          ))}
      </Sheet>

      {confirm && (
        <ActionSheet title={`تحذف «${course.name}» بمواعيدها وملفاتها؟`} close={() => setConfirm(false)} actions={[
          { label: "أيوه، احذفها", icon: <Trash2 size={18} />, danger: true, onClick: () => api.removeCourse(course, close) },
          { label: "رجوع", icon: <X size={18} /> },
        ]} />
      )}
    </>
  );
}
