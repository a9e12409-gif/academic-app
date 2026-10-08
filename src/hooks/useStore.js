import { useEffect, useRef, useState } from "react";
import { KEY, EMPTY } from "../constants";
import { loadData, pruneNotifyGuards } from "../lib/storage";

export function useStore() {
  const [data, setData] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    pruneNotifyGuards();
    const d = loadData() || { ...EMPTY };
    const t = setTimeout(() => { setData(d); setReady(true); }, 320);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready || !data) return;
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
  }, [ready, data]);

  const set = fn => setData(d => fn(d));
  return { data, ready, set };
}

export function useDataRef(data) {
  const ref = useRef(data);
  ref.current = data;
  return ref;
}
