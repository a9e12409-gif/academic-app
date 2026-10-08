import { useEffect, useState } from "react";

export function useMedia(query) {
  const [matches, setMatches] = useState(() => typeof matchMedia === "function" && matchMedia(query).matches);
  useEffect(() => {
    let mq = matchMedia(query);
    const onChange = e => setMatches(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [query]);
  return matches;
}
