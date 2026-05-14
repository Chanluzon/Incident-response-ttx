import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function LiquidButton({ 
  onClick, 
  label, 
  icon: Icon, 
  showArrow = true, 
  showPulse = false,
  disabled = false,

  className = "",
  variant = "primary" // primary, secondary
}) {
  const { isLightMode } = useTheme();

  const isPrimary = variant === "primary";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative overflow-hidden rounded-full
        text-white font-black tracking-[0.2em] sm:tracking-[0.4em]
        flex items-center justify-center gap-3
        transition-all duration-700 hover:scale-[1.05] active:scale-95
        border-2 uppercase
        
        /* Default Sizing - Now more compact */
        h-[50px] sm:h-[58px]
        text-xs sm:text-sm md:text-base
        px-6 sm:px-8
        font-black tracking-[0.2em]
        
        ${disabled ? 'opacity-40 cursor-not-allowed grayscale-[0.5]' : ''}
        ${isPrimary
          ? (isLightMode 
              ? 'bg-blue-600 hover:bg-blue-500 shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:shadow-[0_25px_60px_rgba(37,99,235,0.5)] border-white/40 hover:border-white/60'
              : 'bg-blue-600/40 hover:bg-blue-500/60 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_70px_rgba(37,99,235,0.4)] border-white/20 hover:border-white/40')
          : (isLightMode
              ? 'bg-slate-800 hover:bg-slate-700 shadow-[0_15px_30px_rgba(0,0,0,0.1)] border-white/20'
              : 'bg-white/5 hover:bg-white/10 backdrop-blur-3xl border-white/10 hover:border-white/20 shadow-none')
        }
        ${className}
      `}
    >
      {/* Liquid Shine Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      </div>

      {/* Inner Glow */}
      <div className="absolute inset-0 rounded-full border border-white/10 group-hover:border-white/30 transition-colors duration-700" />

      {/* Pulse Dot */}
      {showPulse && (
        <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-white animate-pulse shadow-[0_0_15px_rgba(255,255,255,1)] flex-shrink-0" />
      )}

      {/* Custom Icon if provided */}
      {Icon && <Icon size={24} className="opacity-70 group-hover:opacity-100 transition-opacity" />}

      {/* Label */}
      <span className="mt-[1px] drop-shadow-md truncate">{label}</span>

      {/* Arrow Icon */}
      {showArrow && (
        <ChevronRight size={24} className="group-hover:translate-x-3 transition-transform duration-500 ease-out opacity-70 group-hover:opacity-100 flex-shrink-0" />
      )}
      
      {/* Liquid Drop Shadow Underneath (only for primary) */}
      {isPrimary && (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      )}
    </button>
  );
}
