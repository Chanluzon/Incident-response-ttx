import React from "react";
import { useTheme } from "../context/ThemeContext";
import StarField from "./StarField";

const PageBackground = ({ children, className = "" }) => {
  const { isLightMode } = useTheme();

  return (
    <div className={`relative flex h-screen w-screen overflow-hidden transition-colors duration-1000 ${isLightMode ? 'bg-slate-50' : 'bg-[#00020a]'} ${className}`}>
      
      {/* SVG Noise Filter for Texture */}
      <svg className="hidden">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
        </filter>
      </svg>

      {/* Primary Deep Gradient: Cosmic Blues */}
      <div className={`absolute inset-0 z-0 transition-all duration-1000 ${
        isLightMode 
          ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50' 
          : 'bg-gradient-to-b from-[#1e40af]/30 via-[#020617] to-[#000000]'
      }`} />
      
      {/* Space-themed Layers (Shared) */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${isLightMode ? 'opacity-[0.05]' : 'opacity-[0.03]'} pointer-events-none`} style={{ filter: 'url(#noiseFilter)' }} />
      <StarField />

      {/* Dark Mode Specific Layers */}
      {!isLightMode && (
        <>
          {/* Secondary static accent gradient for depth */}
          <div className="absolute inset-0 z-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(30,58,138,0.15)_0deg,transparent_120deg,rgba(30,58,138,0.15)_240deg,transparent_360deg)]" />
          
          {/* Deep Nebula Clouds */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_30%,rgba(139,92,246,0.1)_0%,transparent_70%),radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.1)_0%,transparent_70%)] mix-blend-screen" />
        </>
      )}

      {/* High-End Static Blobs / Plasma */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div className={`absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full blur-[160px] opacity-30 transition-colors duration-1000 ${isLightMode ? 'bg-blue-300' : 'bg-blue-600/30'}`} />
        <div className={`absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full blur-[160px] opacity-20 transition-colors duration-1000 ${isLightMode ? 'bg-indigo-200' : 'bg-indigo-800/30'}`} />
        <div className={`absolute top-[10%] right-[-5%] w-[40%] h-[40%] rounded-full blur-[140px] opacity-15 transition-colors duration-1000 ${isLightMode ? 'bg-cyan-200' : 'bg-cyan-400/20'}`} />
        <div className={`absolute bottom-[10%] left-[5%] w-[45%] h-[45%] rounded-full blur-[140px] opacity-10 transition-colors duration-1000 ${isLightMode ? 'bg-indigo-100' : 'bg-indigo-900/20'}`} />
      </div>

      {/* Vignette effect for depth */}
      {!isLightMode && (
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
      )}

      {/* Content Overlay / Backdrop Blur */}
      <div className={`absolute inset-0 z-10 backdrop-blur-[1px] transition-colors duration-1000 ${
        isLightMode ? 'bg-white/10' : 'bg-slate-950/2'
      }`} />

      {/* Content */}
      <div className="relative z-30 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default PageBackground;
