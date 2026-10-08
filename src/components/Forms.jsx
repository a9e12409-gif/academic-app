import { useState } from "react";
import Sheet from "./Sheet";
import { DAYS, TYPES, EXAMS, DURATIONS } from "../constants";
import { useRipple } from "../hooks/useRipple";

function Field({ label, children, hint }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <small className="field-hint">{hint}</small>}
    </label>
  );
}

function ChipRow({ items, value, onChange, ariaLabel }) {
  return (
    <div className="chip-row" role="radiogroup" aria-label={ariaLabel}>
      {items.map(it => (
        <button type="button" key={it.value}
          className={"chip pressable " + (String(value) === String(it.value) ? "on" : "")}
          role="radio" aria-checked={String(value) === String(it.value)}
          onClick={() => onChange(it.value)}>{it.label}</button>
      ))}
    </div>
  );
}

function SubmitBtn({ label, disabled, onClick }) {
  const ripple = useRipple();
  return (
    <button type="button" className={"primary ripple-host" + (disabled ? " off" : "")} disabled={disabled} onClick={onClick} {...ripple}>
      <span>{label}</span>
    </button>
  );
}

export function SessionForm({ courses, close, onSubmit, initial, defaultDay, preCourseId }) {
  const editing = !!initial?.id;
  const [f, setF] = useState(() => ({
    courseId: initial?.courseId || preCourseId || courses[0]?.id || "",
    name: "",
    type: initial?.type || "lecture",
    day: initial?.day ?? defaultDay,
    start: initial?.start || "09:00",
    duration: initial?.duration || 90,
    room: initial?.room || ""
  }));
  const set = patch => setF(o => ({ ...o, ...patch }));
  const valid = (f.courseId && f.courseId !== "new") || f.name.trim().length > 0;

  const submit = e => {
    e?.preventDefault?.();
    if (!valid) return;
    onSubmit(f);
  };

  return (
    <Sheet title={editing ? "تعديل الموعد" : "موعد جديد"} close={close}
      footer={<SubmitBtn label={editing ? "حفظ التعديل" : "إضافة الموعد"} disabled={!valid} onClick={submit} />}>
      <form className="form" onSubmit={submit}>
        <Field label="المادة">
          <div className="select-wrap">
            <select value={f.courseId} onChange={e => set({ courseId: e.target.value, name: "" })}>
              {editing && <option value={initial.courseId}>{initial.courseName} (الحالية)</option>}
              {courses.filter(c => !editing || c.id !== initial.courseId)
                .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              <option value="new">مادة جديدة</option>
            </select>
          </div>
        </Field>
        {(f.courseId === "new" || (!f.courseId && !courses.length)) && (
          <Field label="اسم المادة">
            <input value={f.name} onChange={e => set({ name: e.target.value })} placeholder="مثال: رياضيات ٢" autoFocus />
          </Field>
        )}
        <Field label="النوع">
          <ChipRow ariaLabel="نوع الحصة"
            items={Object.entries(TYPES).map(([value, label]) => ({ value, label }))}
            value={f.type} onChange={v => set({ type: v })} />
        </Field>
        <Field label="اليوم">
          <ChipRow ariaLabel="اليوم"
            items={DAYS.map((label, value) => ({ value, label }))}
            value={f.day} onChange={v => set({ day: v })} />
        </Field>
        <div className="form-grid">
          <Field label="الوقت">
            <input type="time" value={f.start} onChange={e => set({ start: e.target.value || "09:00" })} required />
          </Field>
          <Field label="المدة">
            <ChipRow ariaLabel="المدة بالدقائق"
              items={DURATIONS.map(d => ({ value: d, label: d + " د" }))}
              value={f.duration} onChange={v => set({ duration: v })} />
          </Field>
        </div>
        <Field label="القاعة" hint="اختياري">
          <input value={f.room} onChange={e => set({ room: e.target.value })} placeholder="مثال: قاعة ٣٠٤" />
        </Field>
      </form>
    </Sheet>
  );
}

export function CourseForm({ close, onSubmit, initial }) {
  const editing = !!initial?.id;
  const [f, setF] = useState(() => ({ name: initial?.name || "" }));
  const valid = f.name.trim().length > 0;
  const submit = e => { e?.preventDefault?.(); if (!valid) return; onSubmit(f); };

  return (
    <Sheet title={editing ? "تعديل المادة" : "مادة جديدة"} close={close}
      footer={<SubmitBtn label={editing ? "حفظ" : "إضافة المادة"} disabled={!valid} onClick={submit} />}>
      <form className="form" onSubmit={submit}>
        <Field label="اسم المادة">
          <input value={f.name} onChange={e => setF(o => ({ ...o, name: e.target.value }))} placeholder="مثال: فيزياء ٣" autoFocus />
        </Field>
      </form>
    </Sheet>
  );
}

export function ExamForm({ courses, close, onSubmit, initial }) {
  const editing = !!initial?.id;
  const [f, setF] = useState(() => ({
    courseId: initial?.courseId || courses[0]?.id || "",
    type: initial?.type || "written",
    date: initial?.date || "",
    time: initial?.time || "09:00",
    room: initial?.room || "",
    seating: initial?.seating || ""
  }));
  const set = patch => setF(o => ({ ...o, ...patch }));
  const valid = !!f.courseId && !!f.date && !!f.time;
  const submit = e => { e?.preventDefault?.(); if (!valid) return; onSubmit(f); };

  return (
    <Sheet title={editing ? "تعديل الامتحان" : "امتحان جديد"} close={close}
      footer={<SubmitBtn label={editing ? "حفظ" : "إضافة الامتحان"} disabled={!valid} onClick={submit} />}>
      {!courses.length
        ? <p className="field-hint">أضف موادك الأول عشان تسجّل امتحاناتها.</p>
        : <form className="form" onSubmit={submit}>
          <Field label="المادة">
            <div className="select-wrap">
              <select value={f.courseId} onChange={e => set({ courseId: e.target.value })}>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </Field>
          <Field label="النوع">
            <ChipRow ariaLabel="نوع الامتحان"
              items={Object.entries(EXAMS).map(([value, label]) => ({ value, label }))}
              value={f.type} onChange={v => set({ type: v })} />
          </Field>
          <div className="form-grid">
            <Field label="التاريخ">
              <input type="date" value={f.date} onChange={e => set({ date: e.target.value })} required />
            </Field>
            <Field label="الوقت">
              <input type="time" value={f.time} onChange={e => set({ time: e.target.value || "09:00" })} required />
            </Field>
          </div>
          <div className="form-grid">
            <Field label="القاعة" hint="اختياري">
              <input value={f.room} onChange={e => set({ room: e.target.value })} placeholder="مثال: قاعة الرياضيات" />
            </Field>
            <Field label="رقم الجلوس" hint="اختياري">
              <input value={f.seating} onChange={e => set({ seating: e.target.value })} inputMode="numeric" placeholder="مثال: ٤٢" />
            </Field>
          </div>
        </form>}
    </Sheet>
  );
}

export function RenameForm({ close, onSubmit, initial }) {
  const [name, setName] = useState(initial || "");
  const valid = name.trim().length > 0;
  const submit = e => { e?.preventDefault?.(); if (!valid) return; onSubmit(name.trim()); };
  return (
    <Sheet title="إعادة تسمية" close={close}
      footer={<SubmitBtn label="حفظ الاسم" disabled={!valid} onClick={submit} />}>
      <form className="form" onSubmit={submit}>
        <Field label="الاسم الجديد">
          <input value={name} onChange={e => setName(e.target.value)} autoFocus />
        </Field>
      </form>
    </Sheet>
  );
}

export function WhatsForm({ close, onSubmit, initial }) {
  const [url, setUrl] = useState(initial || "");
  const valid = url.trim().length > 3;
  const submit = e => { e?.preventDefault?.(); if (!valid) return; onSubmit(url.trim()); };
  return (
    <Sheet title="مجموعة المادة" close={close}
      footer={<SubmitBtn label="حفظ الرابط" disabled={!valid} onClick={submit} />}>
      <form className="form" onSubmit={submit}>
        <Field label="رابط المجموعة" hint="الصق رابط الدعوة">
          <input dir="ltr" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://chat.whatsapp.com/…" autoFocus />
        </Field>
      </form>
    </Sheet>
  );
}
