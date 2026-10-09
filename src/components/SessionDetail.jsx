import { useState } from "react";
import { FilePlus2, FileText, Link2, Pencil, Trash2, Video } from "lucide-react";
import { TaskList } from "./TaskList";
import { useI18n } from "../i18n";
import { fmtBytes } from "../lib/utils";

/* مساحة عمل المحطة — تُفتح داخل البطاقة نفسها، بلا نوافذ ولا فقدان سياق */

export default function SessionDetail({ session, data, api, onEdit }) {
  const { t } = useI18n();
  const [confirm, setConfirm] = useState(false);
  const [confirmFile, setConfirmFile] = useState("");
  const r = data.resources[session.id] || {};
  const files = r.files || [];
  const tasks = data.tasks[session.id] || [];

  return (
    <div className="stop-body" onClick={e => e.stopPropagation()}>
      <section className="dsec">
        <h4>{t("station_tasks")} <small>{tasks.filter(x => !x.done).length || ""}</small></h4>
        <TaskList items={tasks} add={x => api.addTask(session.id, x)}
          toggle={api.toggleTask(session.id)} remove={api.removeTask(session.id)} />
      </section>

      <section className="dsec">
        <h4>{t("study_files")}
          <label className="mini-attach pressable">
            <FilePlus2 size={13} /> {t("attach")}
            <input type="file" multiple accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.png,.xlsx"
              onChange={e => { api.attach(session, e.target.files); e.target.value = ""; }} />
          </label>
        </h4>
        {files.length ? files.map(f => (
          <div className="file-row" key={f.id}>
            <button className="pressable" onClick={() => api.openFile(f)}>
              <FileText size={14} />
              <span className="file-name">{f.name}</span>
              {f.size ? <small>{fmtBytes(f.size)}</small> : null}
            </button>
            {confirmFile !== f.id
              ? <button className="icon-x pressable" onClick={() => setConfirmFile(f.id)} aria-label={t("delete")}>×</button>
              : <span className="confirm-row tight">
                  <button className="ghost danger solid pressable" onClick={() => { setConfirmFile(""); api.removeFile(session.id, f); }}>{t("delete")}</button>
                  <button className="ghost pressable" onClick={() => setConfirmFile("")}>{t("cancel")}</button>
                </span>}
          </div>
        )) : <p className="hint">{t("files_hint")}</p>}

        <div className="video-input">
          <Video size={14} className="vid-ic" />
          <input dir="ltr" value={r.videoUrl || ""} placeholder={t("video_ph")} aria-label={t("video_label")}
            onChange={e => api.setVideo(session.id, e.target.value)} />
          <button disabled={!r.videoUrl} onClick={() => api.openVideo(r.videoUrl)} aria-label={t("open")}><Link2 size={14} /></button>
        </div>
      </section>

      <section className="dsec">
        <h4>{t("station_notes")}</h4>
        <textarea rows="2" value={data.notes[session.id] || ""} placeholder={t("notes_ph")} aria-label={t("station_notes")}
          onChange={e => api.setNotes(session.id, e.target.value)} />
      </section>

      <div className="detail-actions">
        <button className="ghost pressable" onClick={onEdit}><Pencil size={14} /> {t("edit")}</button>
        {!confirm
          ? <button className="ghost danger pressable" onClick={() => setConfirm(true)}><Trash2 size={14} /> {t("delete")}</button>
          : <span className="confirm-row">
              <button className="ghost danger solid pressable" onClick={() => api.removeSession(session)}>{t("delete")}</button>
              <button className="ghost pressable" onClick={() => setConfirm(false)}>{t("cancel")}</button>
            </span>}
      </div>
    </div>
  );
}
