import { useEffect, useState } from "react";
import { loadTheme, saveTheme } from "../lib/storage";

export function useTheme() {
  const [theme, setTheme] = useState(() => loadTheme());

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.add("theme-anim");
    let meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === "dark" ? "#0A0C11" : "#F2F3F7";
    saveTheme(theme);
    const t = setTimeout(() => root.classList.remove("theme-anim"), 320);
    return () => clearTimeout(t);
  }, [theme]);

  const toggle = () => setTheme(t => (t === "dark" ? "light" : "dark"));
  return { theme, toggle, setTheme };
}
