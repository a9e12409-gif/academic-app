import { Plus } from "lucide-react";
import { useRipple } from "../hooks/useRipple";

export default function Fab({ onClick, label }) {
  const ripple = useRipple();
  return (
    <button className="fab ripple-host" onClick={onClick} onPointerDown={ripple.onPointerDown}
      ref={ripple.ref} aria-label={label} title={label}>
      <Plus size={24} />
    </button>
  );
}
