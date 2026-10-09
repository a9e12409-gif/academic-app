import { useEffect, useMemo, useRef, useState } from "react";
import { I18nContext, makeT, detectLang } from "./i18n";
import { useStore, useDataRef } from "./hooks/useStore";
import { useTheme } from "./hooks/useTheme";
import { useToast } from "./hooks/useToast";
import { useNow } from "./hooks/useNow";
import { makeApi } from "./hooks/useApi";
import { loadProfile, saveProfile } from "./lib/storage";
import { keyDate, today } from "./lib/utils";

import AnswerBar from "./components/AnswerBar";
import LineWeek from "./components/LineWeek";
import CourseChips from "./components/CourseChips";
import Composer from "./components/Composer";
import FirstRun from "./components/FirstRun";
import Toast from "./components/Toast";
import SettingsSheet from "./components/SettingsSheet";
import { MenuHub, ExamsSheet, LibrarySheet } from "./components/HubPanels";

/* ============================================================
   Campus Line — سطح واحد: الخَط.
   لا تبويبات، لا صفحات. السياق يفتح طبقاته حول الخط.
   ============================================================ */

export default function App() {
  const { data, ready, set } = useStore();
  const dataRef = useDataRef(data);
  const { theme, setTheme } = useTheme();
  const { toast, show, dismiss } = useToast();
  const now = useNow(30000);

  const [profile, setProfileState] = useState(loadProfile);
  const lang = profile.lang || detectLang();

  const [focusDay, setFocusDay] = useState(today());
  const [expanded, setExpanded] = useState("");
  const [highlight, setHighlight] = useState("");
  const [composer, setComposer] = useState(null);
  const [hub, setHub] = useState(null);
  const revealRef = useRef(null);

  const t = useMemo(() => makeT(lang), [lang]);
  const i18n = useMemo(() => ({
    t, lang,
    setLang: l => { const p = { ...loadProfile(), lang: l }; setProfileState(p); saveProfile(p); }
  }), [t, lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = t("app_title");
  }, [lang, t]);

  const api = useMemo(() => makeApi({ dataRef, set, t, show }), [t, lang]);

  // مجدول الإشعارات (١٥ دقيقة قبل المحاضرة)
  useEffect(() => {
    if (!data?.notifyEnabled || !("Notification" in window) || Notification.permission !== "granted") return;
    const check = () => {
      const ix = today(), dk = keyDate(new Date());
      data.sessions.filter(s => +s.day === ix).forEach(s => {
        const [h, m] = s.start.split(":").map(Number);
        const st = new Date(); st.setHours(h, m, 0, 0);
        const diff = st - Date.now();
        const id = "amh:" + dk + ":" + s.id;
        if (diff > 0 && diff <= 900000 && !localStorage.getItem(id)) {
          try { new Notification(t("notif_title"), { body: s.courseName + (s.room ? " · " + s.room : "") }); } catch { /* لا دعم */ }
          localStorage.setItem(id, "1");
        }
      });
    };
    check();
    const iv = setInterval(check, 30000);
    return () => clearInterval(iv);
  }, [data?.notifyEnabled, data?.sessions, t]);

  const scrollToSelector = (sel, delay = 60) =>
    setTimeout(() => document.querySelector(sel)?.scrollIntoView({ behavior: "smooth", block: "center" }), delay);

  const focusStop = session => {
    setFocusDay(+session.day);
    setExpanded(session.id);
    scrollToSelector("#stop-" + session.id, 120);
  };
  const jumpNow = () => {
    setFocusDay(today());
    const ix = today(), nowM = now.getHours() * 60 + now.getMinutes();
    const todays = (data?.sessions || []).filter(s => +s.day === ix).sort((a, b) => a.start.localeCompare(b.start));
    const target = todays.find(s => nowM < s.start.split(":")[0] * 60 + +s.start.split(":")[1] + (s.duration || 90));
    if (target) focusStop(target);
    else scrollToSelector(".wk-focus .wk-head", 80);
  };
  const jumpToExam = (dayIdx, examId) => {
    setFocusDay(dayIdx);
    scrollToSelector("#exam-" + examId, 160);
  };

  const finishFirstRun = name => {
    const p = { ...profile, name, onboarded: true, lang };
    setProfileState(p); saveProfile(p);
  };

  if (!profile.onboarded) {
    return (
      <I18nContext.Provider value={i18n}>
        <FirstRun onFinish={finishFirstRun} />
        <Toast toast={toast} onDismiss={dismiss} />
      </I18nContext.Provider>
    );
  }

  if (!ready || !data) {
    return (
      <I18nContext.Provider value={i18n}>
        <div className="boot-screen" aria-hidden="true"><i className="boot-line" /></div>
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={i18n}>
      <div className="dots" aria-hidden="true" />
      <AnswerBar data={data} onOpenSession={focusStop} onAdd={() => setComposer({ day: focusDay })}
        onMenu={() => setHub("menu")} onJumpNow={jumpNow} />

      <main className="canvas">
        <CourseChips data={data} api={api} highlight={highlight} setHighlight={setHighlight} />
        <LineWeek data={data} api={api} now={now}
          focusDay={focusDay} setFocusDay={d => { setFocusDay(d); setExpanded(""); }}
          expanded={expanded} setExpanded={setExpanded}
          openComposer={d => setComposer(d)} highlight={highlight} />
      </main>

      <Toast toast={toast} onDismiss={dismiss} />

      {composer && <Composer draft={composer} sessions={data.sessions} close={() => setComposer(null)} api={api} />}
      {hub === "menu" && <MenuHub data={data} close={() => setHub(null)} onSelect={setHub} />}
      {hub === "exams" && <ExamsSheet data={data} close={() => setHub(null)} onJump={jumpToExam} />}
      {hub === "lib" && <LibrarySheet data={data} api={api} close={() => setHub(null)} />}
      {hub === "set" && (
        <SettingsSheet api={api} close={() => setHub(null)} profile={profile} theme={theme}
          setTheme={setTheme} setLang={i18n.setLang} notifyOn={!!data.notifyEnabled}
          saveName={n => { const p = { ...profile, name: n }; setProfileState(p); saveProfile(p); show(t("toast_name_saved")); }} />
      )}
    </I18nContext.Provider>
  );
}
