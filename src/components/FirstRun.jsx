import { useState } from "react";
import { useI18n } from "../i18n";

/* أول لقاء — بلا معالجات: اسم العلامة، اختيار اللغة، ودخول مباشر إلى الخط */

export default function FirstRun({ onFinish }) {
  const { t, lang, setLang } = useI18n();
  const [name, setName] = useState("");

  return (
    <div className="firstrun">
      <div className="fr-mark" aria-hidden="true">
        <svg viewBox="0 0 120 60" width="150" height="76">
          <path d="M8 44 H46 A10 10 0 0 0 56 34 V26 A10 10 0 0 1 66 16 H112" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity=".35" />
          <circle cx="8" cy="44" r="5" fill="currentColor" />
          <circle cx="112" cy="16" r="5" fill="currentColor" />
          <circle cx="60" cy="30" r="7" fill="var(--accent)" className="fr-node" />
        </svg>
      </div>
      <h1 className="fr-title">{t("fr_t")}</h1>
      <p className="fr-sub">{t("fr_x")}</p>

      <div className="fr-lang" role="radiogroup" aria-label={t("fr_lang")}>
        {[["ar", "العربية"], ["en", "English"]].map(([v, l]) => (
          <button key={v} role="radio" aria-checked={lang === v}
            className={"fr-chip pressable " + (lang === v ? "on" : "")} onClick={() => setLang(v)}>{l}</button>
        ))}
      </div>

      <input className="fr-name" value={name} onChange={e => setName(e.target.value)}
        placeholder={t("fr_name")} aria-label={t("fr_name")}
        onKeyDown={e => { if (e.key === "Enter") onFinish(name.trim()); }} />

      <button className="fr-go pressable" onClick={() => onFinish(name.trim())}>{t("fr_go")}</button>
    </div>
  );
}
