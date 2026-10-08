export const uid = () => crypto.randomUUID?.() || "id-" + Date.now() + Math.random().toString(36).slice(2);
export const norm = s => (s || "").trim().toLocaleLowerCase("ar");
export const today = () => (new Date().getDay() + 1) % 7;

export const keyDate = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
export const dateFor = i => { let d = new Date(), delta = (((i + 6) % 7) - d.getDay() + 7) % 7; d.setDate(d.getDate() + delta); return d; };

export const mins = t => { let p = (t || "00:00").split(":").map(Number); return (p[0] || 0) * 60 + (p[1] || 0); };
export const addMins = (t, n) => { let x = ((mins(t) + n) % 1440 + 1440) % 1440; return String(Math.floor(x / 60)).padStart(2, "0") + ":" + String(x % 60).padStart(2, "0"); };
export const dur = s => s.duration || 90;
export const endOf = s => addMins(s.start, dur(s));
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export const fmt12 = t => { let [h, m] = (t || "00:00").split(":").map(Number); return (h % 12 || 12) + ":" + String(m || 0).padStart(2, "0") + " " + (h < 12 ? "ص" : "م"); };
export const fmt12Range = s => fmt12(s.start) + " – " + fmt12(endOf(s));
export const fmtDate = (d, o = { day: "numeric", month: "short" }) => new Intl.DateTimeFormat("ar-EG", o).format(d);
export const greetName = (h, name) => { let g = h < 5 ? "ليلة هادئة" : h < 12 ? "صباح الخير" : h < 17 ? "نهارك سعيد" : h < 21 ? "مساء الخير" : "ليلة سعيدة"; return name ? g + "، " + name : g; };
export const relTime = n => new Intl.RelativeTimeFormat("ar", { numeric: "auto" }).format(n, "minute");

export const fmtBytes = n => !n ? "" : n < 1024 ? n + " بايت" : n < 1048576 ? Math.round(n / 1024) + " ك.ب" : (n / 1048576).toFixed(1) + " م.ب";

const KINDS = { pdf: "pdf", ppt: "slides", pptx: "slides", doc: "doc", docx: "doc", jpg: "img", jpeg: "img", png: "img", xlsx: "sheet", xls: "sheet" };
export const fileKind = f => KINDS[(f.name.split(".").pop() || "").toLowerCase()] || "file";
