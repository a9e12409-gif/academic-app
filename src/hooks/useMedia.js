import { useEffect, useState } from "react";

const can = () => typeof matchMedia === "function";

export function useMedia(query) {
  const [matches, setMatches] = useState(() => can() && matchMedia(query).matches);
  useEffect(() => {
    if (!can()) return;
    let mq = matchMedia(query);
    const onChange = e => setMatches(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [query]);
  return matches;
}
