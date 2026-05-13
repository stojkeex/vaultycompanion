import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("vaulty_theme");
    return (saved as Theme) || "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    // Apply theme to html element for Tailwind and body for global background
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    
    // Also apply to body to be extra sure
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
    
    // Force background color change
    if (theme === "dark") {
      document.body.style.backgroundColor = "#0a0a0a";
      document.body.style.color = "#ffffff";
    } else {
      document.body.style.backgroundColor = "#ffffff";
      document.body.style.color = "#000000";
    }
    
    localStorage.setItem("vaulty_theme", theme);
    console.log("Theme applied successfully:", theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => setThemeState(newTheme);
  const toggleTheme = () => setThemeState(prev => prev === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
