import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

/**
 * ThemeProvider manages dark/light mode with localStorage persistence.
 * Defaults to dark mode (medical aesthetic) but allows user toggle.
 * Applies the 'dark' class to <html> for Tailwind's class-based dark mode.
 */
export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem("nutrisync-theme");
    if (stored !== null) return stored === "dark";
    // Default to dark mode for the medical aesthetic
    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
    localStorage.setItem("nutrisync-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside a ThemeProvider");
  }
  return context;
}

export default ThemeContext;
