import { LOCALES } from "../constants";

export const uid = () => crypto.randomUUID?.() || "id-" + Date.now() + Math.random().toString(36).slice(2);
export const norm = s => (s || "").trim().toLocaleLowerCase("ar");
export const today = () => (new Date().getDay() + 1) % 7; // السبت = 0

export const localeOf = lang => LOCALES[lang] || LOCALES.en;

export const keyDate = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
export const dateFor = i => { let d = new Date(), delta = (((i + 6) % 7) - d.getDay() + 7) % 7; d.setDate(d.getDate() + delta); return d; };

export const mins = t => { let p = (t || "00:00").split(":").map(Number); return (p[0] || 0) * 60 + (p[1] || 0); };
export const addMins = (t, n) => { let x = ((mins(t) + n) % 1440 + 1440) % 1440; return String(Math.floor(x / 60)).padStart(2, "0") + ":" + String(x % 60).padStart(2, "0"); };
export const dur = s => s.duration || 90;
export const endOf = s => addMins(s.start, dur(s));
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// —— تنسيق الوقت والتاريخ حسب اللغة (يغني عن صيغ يدوية ويضمن ص/م صحيحة)
export const fmtTime = (t, lang) => {
  const [h, m] = (t || "00:00").split(":").map(Number);
  const d = new Date(); d.setHours(h || 0, m || 0, 0, 0);
  return new Intl.DateTimeFormat(localeOf(lang), { hour: "numeric", minute: "2-digit" }).format(d);
};
export const fmtRange = (s, lang) => fmtTime(s.start, lang) + " – " + fmtTime(endOf(s), lang);
export const fmtDate = (d, lang, o = { day: "numeric", month: "short" }) => new Intl.DateTimeFormat(localeOf(lang), o).format(d);
export const fmtWeekday = (i, lang, o = { weekday: "long" }) => fmtDate(dateFor(i), lang, o);
export const relTime = (n, lang) => new Intl.RelativeTimeFormat(lang === "ar" ? "ar" : "en", { numeric: "auto" }).format(n, "minute");

export const greetKey = h => h < 5 ? "g_night" : h < 12 ? "g_morning" : h < 17 ? "g_noon" : h < 21 ? "g_evening" : "g_night";

export const fmtBytes = n => !n ? "" : n < 1024 ? n + (n === 1 ? " byte" : " B") : n < 1048576 ? Math.round(n / 1024) + " KB" : (n / 1048576).toFixed(1) + " MB";

const KINDS = { pdf: "pdf", ppt: "slides", pptx: "slides", doc: "doc", docx: "doc", jpg: "img", jpeg: "img", png: "img", xlsx: "sheet", xls: "sheet" };
export const fileKind = f => KINDS[(f.name.split(".").pop() || "").toLowerCase()] || "file";

// —— كشف تعارض المواعيد (منع الخطأ قبل وقوعه)
export const findClash = (sessions, day, start, duration, excludeId) => {
  const a0 = mins(start), a1 = a0 + (+duration || 90);
  return sessions.find(s => +s.day === +day && s.id !== excludeId &&
    Math.max(a0, mins(s.start)) < Math.min(a1, mins(s.start) + dur(s))) || null;
};

export const durLabel = (m, t) => m >= 60 ? (m % 60 ? Math.floor(m / 60) + "h " + m % 60 + t("minutes_short") : Math.floor(m / 60) + "h") : m + " " + t("minutes_short");
