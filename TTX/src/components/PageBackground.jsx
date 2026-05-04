import React from "react";
import { useTheme } from "../context/ThemeContext";

const PageBackground = ({ children, className = "" }) => {
  const { isLightMode } = useTheme();

  return (
    <div className={`relative flex h-screen w-screen overflow-hidden transition-colors duration-1000 ${isLightMode ? 'bg-slate-50' : 'bg-[#020617]'} ${className}`}>
      {/* Primary Deep Gradient */}
      <div className={`absolute inset-0 z-0 transition-all duration-1000 ${isLightMode ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50' : 'bg-[radial-gradient(circle_at_50%_50%,#0f172a_0%,#020617_100%)]'}`} />
      
      {/* Secondary accent gradient for depth */}
      {!isLightMode && (
        <div className="absolute inset-0 z-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(30,58,138,0.1)_0deg,transparent_120deg,rgba(30,58,138,0.1)_240deg,transparent_360deg)] animate-[spin_60s_linear_infinite]" />
      )}

      {/* High-End Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        {/* Main Blue Glow */}
        <div className={`absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full blur-[140px] animate-float opacity-40 transition-colors duration-1000 ${isLightMode ? 'bg-blue-300' : 'bg-blue-600'}`} />
        
        {/* Deep Indigo Anchor */}
        <div className={`absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full blur-[140px] animate-morph opacity-30 transition-colors duration-1000 ${isLightMode ? 'bg-indigo-200' : 'bg-indigo-800'}`} />
        
        {/* Cyan Highlight (Cyber Feel) */}
        <div className={`absolute top-[10%] right-[-5%] w-[40%] h-[40%] rounded-full blur-[120px] animate-float [animation-delay:2s] opacity-20 transition-colors duration-1000 ${isLightMode ? 'bg-cyan-200' : 'bg-cyan-400'}`} />
        
        {/* Subtle Violet-Blue Depth */}
        <div className={`absolute bottom-[10%] left-[5%] w-[45%] h-[45%] rounded-full blur-[120px] animate-morph [animation-delay:4s] opacity-15 transition-colors duration-1000 ${isLightMode ? 'bg-indigo-100' : 'bg-indigo-900'}`} />
      </div>

      
      {/* Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default PageBackground;
