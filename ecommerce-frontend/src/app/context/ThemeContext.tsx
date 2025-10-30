// context/ThemeContext.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: "light",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // 🔁 Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme") as Theme;
    if (saved) {
      setTheme(saved);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    
    // For Tailwind dark mode
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    
    // For DaisyUI themes
    root.setAttribute("data-theme", theme);
    
    // Persist to localStorage
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  // Prevent flash of unstyled content
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
