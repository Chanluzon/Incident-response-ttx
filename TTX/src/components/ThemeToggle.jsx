import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { isLightMode, toggleTheme } = useTheme();

  return (
    <div className="absolute bottom-6 sm:bottom-8 md:bottom-10 left-6 sm:left-8 md:left-10 z-[100]">
      <button
        onClick={toggleTheme}
        className={`p-3 rounded-full backdrop-blur-xl border transition-all duration-300 shadow-lg hover:scale-110 active:scale-95 ${
          isLightMode 
            ? "bg-white/50 border-slate-300 text-slate-800 hover:bg-white" 
            : "bg-white/10 border-white/20 text-white hover:bg-white/20"
        }`}
      >
        {isLightMode ? <Moon size={24} /> : <Sun size={24} />}
      </button>
    </div>
  );
}
