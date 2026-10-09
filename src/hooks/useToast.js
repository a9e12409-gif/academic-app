import { useEffect, useRef, useState } from "react";

export function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef();

  const show = (msg, opt = {}) => {
    clearTimeout(timer.current);
    setToast({ msg, tone: opt.tone || "ok", action: opt.action || null });
    timer.current = setTimeout(() => setToast(null), opt.action ? 6000 : 2600);
  };
  const dismiss = () => { clearTimeout(timer.current); setToast(null); };

  useEffect(() => () => clearTimeout(timer.current), []);
  return { toast, show, dismiss };
}
