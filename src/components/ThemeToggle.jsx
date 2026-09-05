import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export function getInitialTheme() {
    if (typeof window !== "undefined" && localStorage.getItem("ethyra_theme")) {
        return localStorage.getItem("ethyra_theme") === "dark";
    }
    return typeof window !== "undefined" && document.documentElement.classList.contains("dark");
}

export function applyTheme(isDark) {
    if (typeof window === "undefined") return;
    if (isDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("ethyra_theme", "dark");
    } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("ethyra_theme", "light");
    }
}

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(getInitialTheme);

    useEffect(() => {
        applyTheme(isDark);
    }, [isDark]);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        applyTheme(next);
    };

    return (
        <button
            onClick={toggleTheme}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all duration-300 shadow-md cursor-pointer
        dark:bg-gradient-to-r dark:from-blue-700 dark:to-indigo-800 dark:border-blue-400/50 dark:text-white dark:hover:shadow-blue-500/25 dark:hover:scale-105
        bg-white border-blue-200 text-slate-700 hover:bg-blue-50 hover:scale-105"
            title={isDark ? "Active Theme: Blue Gradient Dark Mode (Text in White)" : "Switch to Blue Gradient Theme"}
        >
            {isDark ? (
                <>
                    <Sun className="w-3.5 h-3.5 text-cyan-300 animate-spin-slow" />
                    <span className="text-white">Blue Gradient Theme</span>
                </>
            ) : (
                <>
                    <Moon className="w-3.5 h-3.5 text-primary" />
                    <span>Dark Theme</span>
                </>
            )}
        </button>
    );
}
