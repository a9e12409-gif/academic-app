import { AlertTriangle, Check } from "lucide-react";
import { useI18n } from "../i18n";

export default function Toast({ toast, onDismiss }) {
  const { t } = useI18n();
  if (!toast) return null;
  return (
    <div className={"toast " + (toast.tone === "err" ? "err" : "")} role="status" aria-live="polite">
      <span className="toast-ic" aria-hidden="true">{toast.tone === "err" ? <AlertTriangle size={15} /> : <Check size={15} />}</span>
      <span className="toast-msg">{toast.msg}</span>
      {toast.action && (
        <button className="toast-act pressable" onClick={() => { toast.action.fn(); onDismiss?.(); }}>
          {toast.action.label}
        </button>
      )}
      <button className="toast-x pressable" onClick={onDismiss} aria-label={t("close")}>×</button>
    </div>
  );
}
