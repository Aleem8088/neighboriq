"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const [theme, setTheme] = useState<"dark" | "light">("dark");

    useEffect(() => {
        const saved = localStorage.getItem("neighboriq-theme") as "dark" | "light" | null;
        if (saved) {
            setTheme(saved);
            document.documentElement.className = saved;
        }
    }, []);

    const toggle = () => {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        document.documentElement.className = next;
        localStorage.setItem("neighboriq-theme", next);
    };

    return (
        <button
            onClick={toggle}
            className="relative w-10 h-10 rounded-xl bg-card border border-border hover:border-border-hover flex items-center justify-center transition-all duration-300 hover:scale-105 group"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
                <Sun className="w-4 h-4 text-yellow-400 group-hover:rotate-45 transition-transform duration-300" />
            ) : (
                <Moon className="w-4 h-4 text-indigo-500 group-hover:-rotate-12 transition-transform duration-300" />
            )}
        </button>
    );
}
