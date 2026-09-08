import { createContext, useContext, useEffect, useState } from "react";

const THEME_STORAGE_KEY = "tickets-theme";
const ThemeContext = createContext(null);

function getInitialTheme() {
  try {
    return sessionStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      sessionStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage can be unavailable in restrictive browser contexts.
    }
  }, [theme]);

  const toggleTheme = () => setTheme((current) => current === "light" ? "dark" : "light");

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const nextTheme = theme === "light" ? "oscuro" : "claro";

  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Cambiar a modo ${nextTheme}`}>
      <span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span>
      <span>Modo {theme === "light" ? "oscuro" : "claro"}</span>
    </button>
  );
}
