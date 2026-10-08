import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useMedia } from "../hooks/useMedia";

export default function Sheet({ title, close, children, footer }) {
  const desktop = useMedia("(min-width: 860px)");
  const [phase, setPhase] = useState("in");
  const [dy, setDy] = useState(0);
  const drag = useRef(null);
  const box = useRef(null);
  const prevFocus = useRef(null);
  const closeTimer = useRef(null);

  const requestClose = () => {
    if (phase === "out") return;
    setPhase("out");
    closeTimer.current = setTimeout(close, 280);
  };

  useEffect(() => {
    prevFocus.current = document.activeElement;
    const t = setTimeout(() => setPhase("show"), 30);
    const onKey = e => {
      if (e.key === "Escape") { e.stopPropagation(); requestClose(); }
      if (e.key !== "Tab" || !box.current) return;
      let f = box.current.querySelectorAll('button,input,select,textarea,a[href],[tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      let first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey, true);
    document.body.classList.add("sheet-lock");
    return () => {
      clearTimeout(t); clearTimeout(closeTimer.current);
      window.removeEventListener("keydown", onKey, true);
      document.body.classList.remove("sheet-lock");
      prevFocus.current?.focus?.();
    };
  }, []);

  const onPointerDown = e => {
    if (desktop) return;
    drag.current = { y: e.clientY, dy: 0, t: performance.now(), t2: performance.now() };
  };
  const onPointerMove = e => {
    if (!drag.current) return;
    const raw = e.clientY - drag.current.y;
    drag.current.dy = raw;
    drag.current.t2 = performance.now();
    setDy(raw < 0 ? Math.max(-12, raw / 6) : raw);
  };
  const onPointerUp = () => {
    if (!drag.current) return;
    const { dy: raw, t, t2 } = drag.current;
    drag.current = null;
    setDy(0);
    const v = t2 > t ? raw / (t2 - t) : 0;
    if (raw > 96 || (v > 0.55 && raw > 8)) requestClose();
  };

  const dragProps = { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp };

  return (
    <div className={"scrim" + (phase === "out" ? " out" : "")}
      style={dy ? { opacity: Math.max(0, 1 - dy / 320) } : undefined}
      onMouseDown={e => e.target === e.currentTarget && requestClose()}>
      <section ref={box} role="dialog" aria-modal="true" aria-label={title}
        className={"sheet " + (phase === "in" ? "in " : phase === "out" ? "out " : "") + (desktop ? "sheet-center " : "")}
        style={!desktop && dy ? { transform: `translateY(${dy}px)` } : undefined}>
        <div className="sheet-top" {...dragProps}>
          <div className="sheet-grip"><i /></div>
          <div className="sheet-head">
            <h2>{title}</h2>
            <button className="icon-btn" onClick={requestClose} aria-label="إغلاق"><X size={18} /></button>
          </div>
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </section>
    </div>
  );
}
