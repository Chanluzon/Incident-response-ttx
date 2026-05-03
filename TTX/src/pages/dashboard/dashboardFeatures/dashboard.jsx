import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

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
    <div className={`relative w-screen min-h-screen overflow-hidden transition-colors duration-1000 ${isLightMode ? 'bg-slate-50' : 'bg-slate-950'}`}>
      {/* Background to match startgame */}
      <div className={`absolute inset-0 z-0 transition-all duration-1000 bg-gradient-to-br ${isLightMode ? 'from-slate-100 via-blue-50 to-slate-200' : 'from-slate-900 via-blue-900 to-indigo-950'}`} />
      
      {/* Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden z-0 opacity-40">
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-float transition-colors duration-1000 ${isLightMode ? 'bg-blue-300/40' : 'bg-blue-600/30'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] animate-morph transition-colors duration-1000 ${isLightMode ? 'bg-indigo-300/30' : 'bg-indigo-600/20'}`} />
        <div className={`absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full blur-[100px] animate-float [animation-delay:2s] transition-colors duration-1000 ${isLightMode ? 'bg-cyan-300/20' : 'bg-cyan-600/20'}`} />
      </div>

      <div className={`relative z-10 min-h-screen p-3 sm:p-4 md:p-5 lg:p-10 overflow-hidden backdrop-blur-md flex flex-col transition-colors duration-1000 ${isLightMode ? 'bg-white/30 text-slate-800' : 'bg-white/10 text-white'}`}>
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
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Group Name Section */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-20 flex flex-col items-center">
            <div className={`text-2xl sm:text-3xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b pb-6 uppercase tracking-[0.4em] sm:tracking-[0.6em] select-none transition-colors duration-1000 ${isLightMode ? 'from-slate-800 to-slate-400 drop-shadow-sm' : 'from-white to-white/50 drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]'}`}>
              <h2 className="ml-[0.4em] sm:ml-[0.6em]">WELCOME</h2>
            </div>

            <div
              className="inline-block relative group animate-float"
            >
              {/* Outer Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500 rounded-3xl" />
              
              <div className={`relative text-2xl sm:text-3xl lg:text-5xl font-black tracking-tight
                backdrop-blur-2xl border
                px-8 sm:px-12 lg:px-16 
                py-4 sm:py-5 lg:py-6 
                rounded-2xl lg:rounded-3xl
                shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_10px_40px_rgba(0,0,0,0.3)] 
                mb-6 transition-transform duration-500 hover:scale-[1.02]
                ${isLightMode ? 'bg-white/60 border-slate-300' : 'bg-slate-900/40 border-white/10'}`}>
                <h1 className="text-transparent bg-clip-text bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 drop-shadow-sm">
                  Team {group ? group.group_name : "..."}
                </h1>
              </div>
            </div>

            <div className={`text-sm sm:text-base lg:text-xl font-medium pt-2 tracking-wide transition-colors duration-1000 ${isLightMode ? 'text-slate-600' : 'text-white/70'}`}>
              <h2>Ready to begin your adventure?</h2>
            </div>
          </div>

          {/* Buttons Container */}
          <div className="w-full max-w-2xl px-4 lg:px-0 flex flex-col gap-4 sm:gap-6 relative z-20">
            {/* Game Instructions */}
            <button
              onClick={instructionsHandler}
              className={`group backdrop-blur-2xl border rounded-[2rem] w-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-left flex items-center p-4 sm:p-5 lg:p-6 transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)] ${isLightMode ? 'bg-white/60 hover:bg-white/90 border-slate-300' : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'}`}
            >
              <div
                className="bg-emerald-500/10 border border-emerald-500/30 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/50 flex items-center justify-center 
                  rounded-2xl lg:rounded-[1.5rem]
                  w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 
                  flex-shrink-0 transition-colors duration-500"
              >
                <img
                  src={Book}
                  alt="Book"
                  className={`w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] ${isLightMode ? 'filter-none drop-shadow-md' : 'brightness-0 invert'}`}
                />
              </div>
              <div className="flex flex-col justify-center pl-4 sm:pl-6 lg:pl-8 min-w-0">
                <span className={`text-lg sm:text-xl lg:text-2xl font-black truncate mb-1 tracking-tight transition-colors duration-500 ${isLightMode ? 'text-slate-800' : 'text-white/90 group-hover:text-white'}`}>
                  Game Instructions
                </span>
                <span className={`text-xs sm:text-sm lg:text-base truncate transition-colors duration-500 font-medium ${isLightMode ? 'text-slate-500 group-hover:text-slate-700' : 'text-white/50 group-hover:text-white/70'}`}>
                  Learn how to play and understand the rules
                </span>
              </div>
              
              <div className="ml-auto pr-2 sm:pr-4 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isLightMode ? 'bg-slate-200' : 'bg-white/10'}`}>
                  <ArrowLeft size={16} className={`rotate-180 ${isLightMode ? 'text-slate-700' : 'text-white'}`} />
                </div>
              </div>
            </button>

            {/* Join Game */}
            <button
              onClick={joinGameHandler}
              className={`group backdrop-blur-2xl border rounded-[2rem] w-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-left flex items-center p-4 sm:p-5 lg:p-6 transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(244,63,94,0.2)] ${isLightMode ? 'bg-white/60 hover:bg-white/90 border-slate-300' : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'}`}
            >
              <div
                className="bg-rose-500/10 border border-rose-500/30 group-hover:bg-rose-500/20 group-hover:border-rose-500/50 flex items-center justify-center 
                  rounded-2xl lg:rounded-[1.5rem]
                  w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 
                  flex-shrink-0 transition-colors duration-500"
              >
                <img
                  src={Flash}
                  alt="Flash"
                  className={`w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)] ${isLightMode ? 'filter-none drop-shadow-md' : 'brightness-0 invert'}`}
                />
              </div>
              <div className="flex flex-col justify-center pl-4 sm:pl-6 lg:pl-8 min-w-0">
                <span className={`text-lg sm:text-xl lg:text-2xl font-black truncate mb-1 tracking-tight transition-colors duration-500 ${isLightMode ? 'text-slate-800' : 'text-white/90 group-hover:text-white'}`}>
                  Join Game
                </span>
                <span className={`text-xs sm:text-sm lg:text-base truncate transition-colors duration-500 font-medium ${isLightMode ? 'text-slate-500 group-hover:text-slate-700' : 'text-white/50 group-hover:text-white/70'}`}>
                  Enter code to join the game
                </span>
              </div>

              <div className="ml-auto pr-2 sm:pr-4 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isLightMode ? 'bg-slate-200' : 'bg-white/10'}`}>
                  <ArrowLeft size={16} className={`rotate-180 ${isLightMode ? 'text-slate-700' : 'text-white'}`} />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
