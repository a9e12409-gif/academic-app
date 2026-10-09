import { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Bell } from "lucide-react";
import Sheet from "./Sheet";
import { useI18n } from "../i18n";

export default function SettingsSheet({ api, close, profile, saveName, theme, setTheme, setLang, notifyOn }) {
  const { t, lang } = useI18n();
  const [name, setName] = useState(profile.name || "");

  const seg = (value, options, onChange, ariaLabel) => (
    <div className="chip-row seg" role="radiogroup" aria-label={ariaLabel}>
      {options.map(o => (
        <button type="button" key={o.value}
          className={"chip pressable " + (value === o.value ? "on" : "")}
          role="radio" aria-checked={value === o.value}
          onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );

  return (
    <Sheet title={t("settings")} close={close}>
      <div className="set-block">
        <h3>{t("st_profile")}</h3>
        <div className="set-name-row">
          <input value={name} onChange={e => setName(e.target.value)} placeholder={t("ob_name_ph")} aria-label={t("ob_name_q")} />
          <button className="outline pressable" disabled={!name.trim() || name.trim() === profile.name}
            onClick={() => { saveName(name.trim()); }}>{t("save")}</button>
        </div>
      </div>

      <div className="set-block">
        <h3>{t("st_language")}</h3>
        {seg(lang, [
          { value: "ar", label: "العربية" },
          { value: "en", label: "English" }
        ], setLang, t("st_language"))}
      </div>

      <div className="set-block">
        <h3>{t("st_appearance")}</h3>
        {seg(theme, [
          { value: "light", label: t("ob_light") },
          { value: "dark", label: t("ob_dark") }
        ], setTheme, t("st_appearance"))}
      </div>

      <div className="set-block">
        <h3>{t("st_alerts")}</h3>
        <button className={"switch-row pressable " + (notifyOn ? "on" : "")} onClick={api.toggleNotify}
          role="switch" aria-checked={notifyOn}>
          <Bell size={17} />
          <span className="switch-txt"><b>{t("ob_notify")}</b><small>{t("st_alerts_x")}</small></span>
          <i className="switch" aria-hidden="true" />
        </button>
      </div>

      <div className="set-block">
        <h3>{t("st_data")}</h3>
        <div className="set-data-row">
          <button className="outline pressable" onClick={api.exportData}><ArrowDownToLine size={15} /> {t("st_export")}</button>
          <label className="outline pressable"><ArrowUpFromLine size={15} /> {t("st_import")}
            <input type="file" accept=".json,application/json"
              onChange={e => { api.requestImport(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
        </div>
        <p className="hint">{t("st_note")}</p>
      </div>
    </Sheet>
  );
}
