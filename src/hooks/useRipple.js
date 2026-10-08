import { useRef } from "react";

export function useRipple() {
  const ref = useRef(null);
  const onPointerDown = e => {
    const el = ref.current;
    if (!el || e.pointerType === "mouse" && e.button !== 0) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const d = Math.max(r.width, r.height) * 2;
    const span = document.createElement("span");
    span.className = "ripple";
    span.style.width = span.style.height = d + "px";
    span.style.left = e.clientX - r.left - d / 2 + "px";
    span.style.top = e.clientY - r.top - d / 2 + "px";
    el.appendChild(span);
    setTimeout(() => span.remove(), 650);
  };
  return { ref, onPointerDown };
}
