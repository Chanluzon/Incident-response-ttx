import React from "react";
import { useTheme } from "../context/ThemeContext";
import StarField from "./StarField";

const PageBackground = ({ children, className = "" }) => {
  const { isLightMode } = useTheme();

  return (
    <div className={`relative flex h-screen w-screen overflow-hidden transition-colors duration-1000 ${isLightMode ? 'bg-[#f8fafc]' : 'bg-[#020617]'} ${className}`}>
      
      {/* SVG Noise Filter for Texture */}
      <svg className="hidden">
        <filter id="glassNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>

      {/* Primary Deep Gradient Base */}
      <div className={`absolute inset-0 z-0 transition-all duration-1000 ${
        isLightMode 
          ? 'bg-gradient-to-tr from-blue-50 via-white to-indigo-50' 
          : 'bg-gradient-to-b from-[#0f172a] via-[#020617] to-black'
      }`} />
      
      {/* Tactical Glass Texture Overlay */}
      <div className={`absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-overlay`} style={{ filter: 'url(#glassNoise)' }} />
      
      {/* Celestial Depth Layer */}
      <div className="absolute inset-0 z-0">
        <StarField />
      </div>

      {/* Liquid Plasma Blobs - High Fidelity Morphing */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        {/* Primary Liquid Mass */}
        <div className={`absolute top-[-25%] left-[-15%] w-[85%] h-[85%] rounded-full blur-[100px] opacity-40 transition-colors duration-1000 animate-morph animate-float ${isLightMode ? 'bg-blue-300' : 'bg-blue-600/30'}`} />
        
        {/* Secondary Fluid Accent */}
        <div className={`absolute bottom-[-20%] right-[-10%] w-[75%] h-[75%] rounded-full blur-[120px] opacity-30 transition-colors duration-1000 animate-morph animate-float [animation-delay:3s] ${isLightMode ? 'bg-indigo-300' : 'bg-indigo-800/40'}`} />
        
        {/* Dynamic Refractive Highlights */}
        <div className={`absolute top-[15%] right-[-5%] w-[50%] h-[50%] rounded-full blur-[90px] opacity-25 transition-colors duration-1000 animate-morph animate-float [animation-delay:6s] ${isLightMode ? 'bg-cyan-200' : 'bg-cyan-500/30'}`} />
        
        {/* Subtle Depth Accents */}
        <div className={`absolute bottom-[10%] left-[5%] w-[60%] h-[60%] rounded-full blur-[110px] opacity-20 transition-colors duration-1000 animate-morph animate-float [animation-delay:9s] ${isLightMode ? 'bg-violet-200' : 'bg-violet-900/30'}`} />
      </div>

      {/* High-End Refraction Layer (Conic) */}
      {!isLightMode && (
        <div className="absolute inset-0 z-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(30,58,138,0.1)_0deg,transparent_120deg,rgba(30,58,138,0.1)_240deg,transparent_360deg)] opacity-50" />
      )}

      {/* Shimmering Surface Overlay */}
      <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${isLightMode ? 'bg-white/5' : 'bg-blue-500/5'} mix-blend-overlay animate-pulse-slow`} />

      {/* Vignette effect for tactical focus */}
      <div className={`absolute inset-0 z-0 pointer-events-none ${
        isLightMode 
          ? 'bg-[radial-gradient(circle_at_center,transparent_40%,rgba(255,255,255,0.4)_100%)]' 
          : 'bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.6)_100%)]'
      }`} />

      {/* Content */}
      <div className="relative z-30 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default PageBackground;
