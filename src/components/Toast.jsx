import { Check } from "lucide-react";

export default function Toast({ msg }) {
  if (!msg) return null;
  return <div className="toast" role="status" aria-live="polite"><Check size={15} />{msg}</div>;
}
