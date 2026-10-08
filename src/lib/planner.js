import { uid, norm, mins, endOf, fileKind } from "./utils";

export function createSession(d, f) {
  let c = d.courses.find(c => c.id === f.courseId) || d.courses.find(c => norm(c.name) === norm(f.name)) || { id: uid(), name: f.name.trim(), maxAbsences: 3, whatsapp: "" };
  let s = { id: uid(), courseId: c.id, courseName: c.name, day: +f.day, type: f.type, start: f.start, duration: +f.duration || 90, room: (f.room || "").trim() };
  return { data: { ...d, courses: d.courses.some(x => x.id === c.id) ? d.courses : [...d.courses, c], sessions: [...d.sessions, s] }, courseId: c.id, sessionId: s.id };
}

export function editSession(d, id, f) {
  let courses = d.courses;
  let target = d.sessions.find(s => s.id === id);
  let course = courses.find(c => c.id === f.courseId);
  if (!course && f.name?.trim()) { course = { id: uid(), name: f.name.trim(), maxAbsences: 3, whatsapp: "" }; courses = [...courses, course]; }
  let courseId = course?.id || target.courseId;
  return {
    data: {
      ...d, courses,
      sessions: d.sessions.map(s => s.id === id
        ? { ...s, courseId, courseName: course?.name || target.courseName, day: +f.day, type: f.type, start: f.start, duration: +f.duration || 90, room: (f.room || "").trim() }
        : s)
    }, courseId
  };
}

export function removeSession(d, id) {
  let fileIds = (d.resources[id]?.files || []).map(f => f.id);
  const purge = obj => { let o = {}; for (let k in obj) if (k !== id && !k.startsWith(id + ":")) o[k] = obj[k]; return o; };
  return {
    data: { ...d, sessions: d.sessions.filter(s => s.id !== id), attendance: purge(d.attendance), tasks: purge(d.tasks), notes: purge(d.notes), resources: purge(d.resources) },
    fileIds
  };
}

export function editCourse(d, id, patch) {
  let c = d.courses.find(c => c.id === id); if (!c) return d;
  let name = patch.name?.trim() || c.name;
  return {
    ...d,
    courses: d.courses.map(c => c.id === id ? { ...c, ...patch, name } : c),
    sessions: d.sessions.map(s => s.courseId === id ? { ...s, courseName: name } : s),
    exams: d.exams.map(e => e.courseId === id ? { ...e, courseName: name } : e)
  };
}

export function removeCourse(d, id) {
  let sIds = d.sessions.filter(s => s.courseId === id).map(s => s.id);
  let fileIds = sIds.flatMap(sid => (d.resources[sid]?.files || []).map(f => f.id));
  const purge = obj => { let o = {}; for (let k in obj) if (!sIds.some(sid => k === sid || k.startsWith(sid + ":"))) o[k] = obj[k]; return o; };
  return {
    data: {
      ...d,
      courses: d.courses.filter(c => c.id !== id),
      sessions: d.sessions.filter(s => s.courseId !== id),
      exams: d.exams.filter(e => e.courseId !== id),
      attendance: purge(d.attendance), tasks: purge(d.tasks), notes: purge(d.notes), resources: purge(d.resources)
    },
    fileIds
  };
}

export function createExam(d, f) {
  let c = d.courses.find(c => c.id === f.courseId); if (!c) return d;
  return { ...d, exams: [...d.exams, { ...f, id: uid(), courseName: c.name }] };
}

export function editExam(d, id, f) {
  let c = d.courses.find(c => c.id === f.courseId);
  return { ...d, exams: d.exams.map(e => e.id === id ? { ...e, ...f, courseName: c?.name || e.courseName } : e) };
}

export function courseNextSession(d, courseId, dayNow, nowMins) {
  let best = null, bestScore = Infinity;
  d.sessions.filter(s => s.courseId === courseId).forEach(s => {
    let delta = (s.day - dayNow + 7) % 7;
    if (delta === 0 && nowMins >= mins(s.start) + (s.duration || 90)) delta = 7;
    let score = delta * 1440 + mins(s.start);
    if (score < bestScore) { bestScore = score; best = { session: s, delta }; }
  });
  return best;
}

export function allFiles(d) {
  let out = [];
  d.sessions.forEach(s => {
    let r = d.resources[s.id] || {};
    (r.files || []).forEach(f => out.push({ ...f, sessionId: s.id, courseId: s.courseId, courseName: s.courseName, kind: fileKind(f) }));
    if (r.videoUrl) out.push({ id: "v:" + s.id, video: true, url: r.videoUrl, sessionId: s.id, courseId: s.courseId, courseName: s.courseName, name: "شرح مرئي " + s.courseName, kind: "video" });
  });
  return out.sort((a, b) => (b.added || 0) - (a.added || 0));
}
