import { useEffect, useRef, useState } from "react";

export function useToast() {
  const [toast, setToast] = useState("");
  const timer = useRef();

  const show = msg => {
    setToast(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 2600);
  };

  useEffect(() => () => clearTimeout(timer.current), []);
  return { toast, show };
}
