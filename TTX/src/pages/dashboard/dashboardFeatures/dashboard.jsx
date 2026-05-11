import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import PageBackground from "../../../components/PageBackground";
import LiquidButton from "../../../components/LiquidButton";

import Book from "../../../images/book.png";
import Flash from "../../../images/flash.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const { isLightMode } = useTheme();

  useEffect(() => {
    const storedGroup = localStorage.getItem("currentGroup");
    if (storedGroup) {
      const parsed = JSON.parse(storedGroup);
      setGroup(parsed.group);
    }
  }, []);

  const instructionsHandler = () => {
    navigate("GameInstructions");
  };

  const joinGameHandler = () => {
    navigate("/GameList");
  };

  return (
    <PageBackground>
      <div className={`relative z-10 min-h-screen p-3 sm:p-4 md:p-5 lg:p-10 flex flex-col transition-colors duration-1000 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
        {/* Back Button */}
        <button
          onClick={() => navigate("/SetUp")}
          className={`absolute top-4 sm:top-6 lg:top-8 left-4 sm:left-6 lg:left-8
            flex items-center gap-2
            px-4 lg:px-5 py-2 lg:py-2.5 rounded-full
            backdrop-blur-xl border transition-all duration-300 group shadow-lg
            font-medium text-sm md:text-base
            hover:-translate-x-1
            ${isLightMode 
              ? 'bg-white/50 hover:bg-white/80 border-slate-300 text-slate-600 hover:text-slate-900 shadow-[0_0_20px_rgba(0,0,0,0.05)]' 
              : 'bg-white/5 hover:bg-white/15 border-white/10 hover:border-white/30 text-white/80 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]'
            }`}
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform duration-300"
          />
          <span className="hidden sm:inline tracking-wide">Back to Setup</span>
        </button>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center py-4 sm:py-6 lg:py-8">
          {/* Group Name Section */}
          <div className="text-center mb-6 sm:mb-8 lg:mb-12 flex flex-col items-center relative py-6 sm:py-8 lg:py-10 px-8 sm:px-12 rounded-[2.5rem] sm:rounded-[3rem] backdrop-blur-md border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] animate-[fadeIn_1s_ease-out_forwards]">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-[2.5rem] sm:rounded-[3rem] -z-10" />
            
            <div className={`text-xl sm:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b pb-3 sm:pb-4 uppercase tracking-[0.4em] sm:tracking-[0.6em] select-none transition-colors duration-1000 ${isLightMode ? 'from-slate-800 to-slate-400 drop-shadow-sm' : 'from-white to-white/50 drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]'}`}>
              <h2 className="ml-[0.4em] sm:ml-[0.6em]">WELCOME</h2>
            </div>

            <div
              className="inline-block relative group animate-float"
            >
              {/* Outer Liquid Glow */}
              <div className="absolute inset-[-15px] bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-700 rounded-[2rem]" />
              
              <div className={`relative text-xl sm:text-2xl lg:text-4xl font-black tracking-tight
                backdrop-blur-3xl border-2
                px-8 sm:px-12 lg:px-16 
                py-3 sm:py-4 lg:py-6 
                rounded-[1.5rem] lg:rounded-[2rem]
                shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_20px_50px_rgba(0,0,0,0.4)] 
                mb-3 transition-all duration-700 hover:scale-[1.03]
                ${isLightMode ? 'bg-white/70 border-white/60' : 'bg-slate-900/50 border-white/15'}`}>
                <h1 className="text-transparent bg-clip-text bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 drop-shadow-md">
                  Team {group ? group.group_name : "..."}
                </h1>
              </div>
            </div>

            <div className={`text-xs sm:text-sm lg:text-lg font-medium pt-2 tracking-wide transition-colors duration-1000 ${isLightMode ? 'text-slate-600' : 'text-white/70'}`}>
              <h2>Ready to begin your adventure?</h2>
            </div>
          </div>

          {/* Buttons Container */}
          <div className="w-full max-w-xl px-4 lg:px-0 flex flex-col gap-4 sm:gap-6 relative z-20">
            {/* Game Instructions */}
            <button
              onClick={instructionsHandler}
              className={`group relative overflow-hidden backdrop-blur-3xl border-2 rounded-[2rem] w-full shadow-[0_15px_40px_rgba(0,0,0,0.1)] text-left flex items-center p-4 sm:p-5 lg:p-6 transition-all duration-700 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(6,182,212,0.25)] ${isLightMode ? 'bg-white/70 hover:bg-white/90 border-white/60' : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'}`}
            >
              <div
                className="bg-cyan-500/10 border border-cyan-500/30 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/50 flex items-center justify-center 
                  rounded-xl lg:rounded-[1.4rem]
                  w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 
                  flex-shrink-0 transition-all duration-700 shadow-inner"
              >
                <img
                  src={Book}
                  alt="Book"
                  className={`w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)] ${isLightMode ? 'filter-none drop-shadow-md' : 'brightness-0 invert'}`}
                />
              </div>
              <div className="flex flex-col justify-center pl-5 sm:pl-6 lg:pl-8 min-w-0 relative z-10">
                <span className={`text-lg sm:text-xl lg:text-2xl font-black truncate mb-0.5 tracking-tight transition-colors duration-500 ${isLightMode ? 'text-slate-800' : 'text-white/90 group-hover:text-white'}`}>
                  Game Instructions
                </span>
                <span className={`text-xs sm:text-sm lg:text-base truncate transition-colors duration-500 font-medium ${isLightMode ? 'text-slate-500 group-hover:text-slate-700' : 'text-white/50 group-hover:text-white/70'}`}>
                  Learn how to play and understand the rules
                </span>
              </div>
              
              {/* Liquid Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              <div className="ml-auto pr-2 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-700">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${isLightMode ? 'bg-white' : 'bg-white/10'}`}>
                  <ArrowLeft size={18} className={`rotate-180 ${isLightMode ? 'text-blue-600' : 'text-cyan-400'}`} />
                </div>
              </div>
            </button>

            {/* Join Game */}
            <button
              onClick={joinGameHandler}
              className={`group relative overflow-hidden backdrop-blur-3xl border-2 rounded-[2rem] w-full shadow-[0_15px_40px_rgba(0,0,0,0.1)] text-left flex items-center p-4 sm:p-5 lg:p-6 transition-all duration-700 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(37,99,235,0.25)] ${isLightMode ? 'bg-white/70 hover:bg-white/90 border-white/60' : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'}`}
            >
              <div
                className="bg-blue-500/10 border border-blue-500/30 group-hover:bg-blue-500/20 group-hover:border-blue-500/50 flex items-center justify-center 
                  rounded-xl lg:rounded-[1.4rem]
                  w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 
                  flex-shrink-0 transition-all duration-700 shadow-inner"
              >
                <img
                  src={Flash}
                  alt="Flash"
                  className={`w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 drop-shadow-[0_0_10px_rgba(37,99,235,0.6)] ${isLightMode ? 'filter-none drop-shadow-md' : 'brightness-0 invert'}`}
                />
              </div>
              <div className="flex flex-col justify-center pl-5 sm:pl-6 lg:pl-8 min-w-0 relative z-10">
                <span className={`text-lg sm:text-xl lg:text-2xl font-black truncate mb-0.5 tracking-tight transition-colors duration-500 ${isLightMode ? 'text-slate-800' : 'text-white/90 group-hover:text-white'}`}>
                  Join Game
                </span>
                <span className={`text-xs sm:text-sm lg:text-base truncate transition-colors duration-500 font-medium ${isLightMode ? 'text-slate-500 group-hover:text-slate-700' : 'text-white/50 group-hover:text-white/70'}`}>
                  Enter code to join the game
                </span>
              </div>

              {/* Liquid Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              <div className="ml-auto pr-2 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-700">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${isLightMode ? 'bg-white' : 'bg-white/10'}`}>
                  <ArrowLeft size={18} className={`rotate-180 ${isLightMode ? 'text-blue-600' : 'text-blue-400'}`} />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </PageBackground>
  );
}

