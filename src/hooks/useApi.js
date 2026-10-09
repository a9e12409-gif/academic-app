import { EMPTY } from "../constants";
import * as P from "../lib/planner";
import { deleteFile, getFile, putFile } from "../lib/storage";
import { norm, uid } from "../lib/utils";

/* ============================================================
   طبقة الأفعال — الجيل الثاني (بلا نوافذ وسيطة)
   الحذف = تأكيد داخل البطاقة + تراجع ٦ ثوانٍ
   ============================================================ */

export function makeApi(deps) {
  const { dataRef, set, t, show } = deps;

  const destroyWithUndo = (next, fileIds) => {
    const snap = JSON.stringify(dataRef.current);
    const timers = [];
    set(() => next);
    if (fileIds?.length) timers.push(setTimeout(() => fileIds.forEach(id => deleteFile(id).catch(() => {})), 6000));
    show(t("toast_deleted"), { action: { label: t("undo"), fn: () => { timers.forEach(clearTimeout); set(() => JSON.parse(snap)); show(t("toast_restored")); } } });
  };

  const api = {
    // ============ الحصص ============
    saveSession: (f, initial) => {
      if (initial) {
        set(d => P.editSession(d, initial.id, { ...f, courseId: initial.courseId }).data);
        show(t("toast_saved"));
      } else {
        const res = P.createSession(dataRef.current, { ...f, courseId: "" });
        set(() => res.data);
        show(t("toast_session_added"));
      }
    },
    removeSession: session => {
      const { data: next, fileIds } = P.removeSession(dataRef.current, session.id);
      destroyWithUndo(next, fileIds);
    },

    // ============ المواد ============
    renameCourse: (courseId, name) => {
      const clean = (name || "").trim();
      if (!clean) return;
      if (dataRef.current.courses.some(c => c.id !== courseId && norm(c.name) === norm(clean))) {
        show(t("toast_course_exists"), { tone: "err" }); return;
      }
      set(d => P.editCourse(d, courseId, { name: clean }));
      show(t("toast_saved"));
    },
    removeCourse: course => {
      const { data: next, fileIds } = P.removeCourse(dataRef.current, course.id);
      destroyWithUndo(next, fileIds);
    },
    saveWhats: (courseId, url) => {
      set(d => ({ ...d, courses: d.courses.map(c => c.id === courseId ? { ...c, whatsapp: url } : c) }));
      show(t("toast_link_saved"));
    },
    openWhats: course => {
      if (!course.whatsapp) return;
      const u = course.whatsapp.startsWith("http") ? course.whatsapp : "https://" + course.whatsapp;
      window.open(u, "_blank", "noopener,noreferrer");
    },

    // ============ التكليفات والملاحظات ============
    addTask: (sid, title) => {
      if (!title?.trim()) return;
      set(d => ({ ...d, tasks: { ...d.tasks, [sid]: [...(d.tasks[sid] || []), { id: uid(), title: title.trim(), done: false }] } }));
    },
    toggleTask: sid => tid => set(d => ({ ...d, tasks: { ...d.tasks, [sid]: (d.tasks[sid] || []).map(x => x.id === tid ? { ...x, done: !x.done } : x) } })),
    removeTask: sid => tid => set(d => ({ ...d, tasks: { ...d.tasks, [sid]: (d.tasks[sid] || []).filter(x => x.id !== tid) } })),
    setNotes: (sid, v) => set(d => ({ ...d, notes: { ...d.notes, [sid]: v } })),
    setVideo: (sid, v) => set(d => ({ ...d, resources: { ...d.resources, [sid]: { ...(d.resources[sid] || {}), videoUrl: v } } })),

    // ============ الملفات ============
    attach: async (session, list) => {
      const files = [...(dataRef.current.resources[session.id]?.files || [])];
      let ok = 0;
      for (const f of Array.from(list || [])) {
        try { const id = uid(); await putFile(id, f); files.push({ id, name: f.name, size: f.size, type: f.type, added: Date.now() }); ok++; } catch { /* ملف فاشل يُتجاهل */ }
      }
      if (ok) {
        set(d => ({ ...d, resources: { ...d.resources, [session.id]: { ...(d.resources[session.id] || {}), files } } }));
        show(t(ok > 1 ? "toast_files_added" : "toast_file_added"));
      } else show(t("toast_file_fail"), { tone: "err" });
    },
    openFile: async f => {
      const blob = await getFile(f.id).catch(() => null);
      if (!blob) { show(t("toast_file_missing"), { tone: "err" }); return; }
      const u = URL.createObjectURL(blob);
      window.open(u, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(u), 60000);
    },
    removeFile: (sessionId, file) => {
      const snap = JSON.stringify(dataRef.current);
      set(d => {
        const r = d.resources[sessionId] || {};
        return { ...d, resources: { ...d.resources, [sessionId]: { ...r, files: (r.files || []).filter(x => x.id !== file.id) } } };
      });
      const timer = setTimeout(() => deleteFile(file.id).catch(() => {}), 6000);
      show(t("toast_deleted"), { action: { label: t("undo"), fn: () => { clearTimeout(timer); set(() => JSON.parse(snap)); show(t("toast_restored")); } } });
    },
    removeVideo: sessionId => {
      set(d => {
        const r = { ...(d.resources[sessionId] || {}) }; delete r.videoUrl;
        return { ...d, resources: { ...d.resources, [sessionId]: r } };
      });
      show(t("toast_deleted"));
    },
    openVideo: url => {
      const u = (url || "").startsWith("http") ? url : "https://" + url;
      window.open(u, "_blank", "noopener,noreferrer");
    },

    // ============ الامتحانات ============
    saveExam: (f, initial) => {
      set(d => {
        const name = (f.name || initial?.courseName || "").trim();
        let c = d.courses.find(c => norm(c.name) === norm(name)) || { id: uid(), name, whatsapp: "" };
        const courses = d.courses.some(x => x.id === c.id) ? d.courses : [...d.courses, c];
        const exams = initial
          ? d.exams.map(e => e.id === initial.id ? { ...e, courseId: c.id, courseName: c.name, type: f.type, date: f.date, time: f.time, room: (f.room || "").trim() } : e)
          : [...d.exams, { id: uid(), courseId: c.id, courseName: c.name, type: f.type, date: f.date, time: f.time, room: (f.room || "").trim() }];
        return { ...d, courses, exams };
      });
      show(t(initial ? "toast_saved" : "toast_exam_added"));
    },
    removeExam: id => {
      const snap = JSON.stringify(dataRef.current);
      set(d => ({ ...d, exams: d.exams.filter(e => e.id !== id) }));
      show(t("toast_deleted"), { action: { label: t("undo"), fn: () => { set(() => JSON.parse(snap)); show(t("toast_restored")); } } });
    },

    // ============ البيانات ============
    exportData: () => {
      const blob = new Blob([JSON.stringify({ app: "Campus Line", version: 2, data: dataRef.current }, null, 2)], { type: "application/json" });
      const u = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = u; a.download = "campus-line-backup.json"; a.click();
      URL.revokeObjectURL(u);
      show(t("toast_exported"));
    },
    importData: async file => {
      try {
        let d = JSON.parse(await file.text());
        d = d.data || d;
        if (!Array.isArray(d.courses) || !Array.isArray(d.sessions)) throw new Error("bad");
        set(() => ({ ...EMPTY, ...d }));
        show(t("toast_imported"));
      } catch { show(t("toast_bad_json"), { tone: "err" }); }
    },

    // ============ الإشعارات ============
    toggleNotify: async () => {
      if (dataRef.current.notifyEnabled) {
        set(d => ({ ...d, notifyEnabled: false }));
        show(t("toast_notif_off"));
        return;
      }
      if (!("Notification" in window)) { show(t("toast_notif_none"), { tone: "err" }); return; }
      let p = Notification.permission;
      if (p === "default") { try { p = await Notification.requestPermission(); } catch { p = "denied"; } }
      if (p === "granted") { set(d => ({ ...d, notifyEnabled: true })); show(t("toast_notif_on")); }
      else show(t("toast_notif_denied"), { tone: "err" });
    }
  };

  return api;
}
