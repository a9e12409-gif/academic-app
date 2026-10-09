import { KEY, PROFILE_KEY, THEME_KEY, EMPTY } from "../constants";
import { keyDate } from "./utils";

export function loadData() {
  try {
    let d = JSON.parse(localStorage.getItem(KEY) || "null");
    if (d && Array.isArray(d.courses) && Array.isArray(d.sessions)) return { ...EMPTY, ...d };
  } catch {}
  return null;
}

export function loadProfile() {
  try { return { name: "", onboarded: false, ...JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}") }; }
  catch { return { name: "", onboarded: false }; }
}
export function saveProfile(p) { try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch {} }

export function loadTheme() {
  try { let t = localStorage.getItem(THEME_KEY); if (t === "dark" || t === "light") return t; } catch {}
  return "dark"; // الهوية داكنة أولًا — قرار تصميمي متعمد
}
export function saveTheme(t) { try { localStorage.setItem(THEME_KEY, t); } catch {} }

export function pruneNotifyGuards() {
  try {
    let prefix = "amh:", todayKey = prefix + keyDate(new Date()) + ":", drop = [];
    for (let i = 0; i < localStorage.length; i++) { let k = localStorage.key(i); if (k && k.startsWith(prefix) && !k.startsWith(todayKey)) drop.push(k); }
    drop.forEach(k => localStorage.removeItem(k));
  } catch {}
}

const db = typeof indexedDB === "undefined" ? Promise.resolve(null) : new Promise((resolve, reject) => {
  let r = indexedDB.open("academic-metro-hub-files", 1);
  r.onupgradeneeded = () => r.result.createObjectStore("files", { keyPath: "id" });
  r.onsuccess = () => resolve(r.result);
  r.onerror = () => reject(r.error);
});

export async function putFile(id, blob) {
  let d = await db; if (!d) throw Error("no-db");
  return new Promise((res, rej) => { let t = d.transaction("files", "readwrite"); t.objectStore("files").put({ id, blob }); t.oncomplete = res; t.onerror = () => rej(t.error); });
}
export async function getFile(id) {
  let d = await db; if (!d) return null;
  return new Promise((res, rej) => { let r = d.transaction("files").objectStore("files").get(id); r.onsuccess = () => res(r.result?.blob || null); r.onerror = () => rej(r.error); });
}
export async function deleteFile(id) {
  let d = await db; if (!d) return;
  return new Promise((res, rej) => { let t = d.transaction("files", "readwrite"); t.objectStore("files").delete(id); t.oncomplete = res; t.onerror = () => rej(t.error); });
}
