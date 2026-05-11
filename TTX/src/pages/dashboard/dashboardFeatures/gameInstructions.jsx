import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import PageBackground from "../../../components/PageBackground";

// Icons
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Images
import Book from "../../../images/book.png";
import People from "../../../images/people.png";

export default function GameInstructions() {
  const navigate = useNavigate();
  const { isLightMode } = useTheme();

  // Navigation Handler
  const backToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <PageBackground>
      <div className="relative z-10 w-full min-h-screen overflow-auto p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col items-center">
        {/* Back Button - Pinned to Left Corner */}
        <button
          onClick={backToDashboard}
          className={`absolute top-6 left-6 flex items-center gap-2
          px-4 lg:px-5 py-2 lg:py-2.5 rounded-full
          backdrop-blur-xl border transition-all duration-300 group z-50 shadow-lg
          font-medium text-sm md:text-base hover:-translate-x-1
          ${isLightMode
              ? 'bg-white/50 hover:bg-white/80 border-slate-300 text-slate-600 hover:text-slate-900 shadow-[0_0_20px_rgba(0,0,0,0.05)]'
              : 'bg-white/5 hover:bg-white/15 border-white/10 hover:border-white/30 text-white/80 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]'
            }`}
        >
          <FontAwesomeIcon
            icon={faChevronLeft}
            className="group-hover:-translate-x-1 transition-transform duration-300"
          />
          <span className="tracking-wide">Dashboard</span>
        </button>

        {/* Header */}
        <div className="text-center pt-8 sm:pt-10 lg:pt-12 pb-8 sm:pb-10 font-medium w-full max-w-5xl">
          <p className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br tracking-tight transition-colors duration-1000 mb-2 ${isLightMode ? 'from-slate-800 to-slate-500 drop-shadow-sm' : 'from-white to-white/70 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]'}`}>
            Game Instructions
          </p>
          <h3 className={`text-base sm:text-lg md:text-xl font-medium tracking-wide transition-colors duration-1000 ${isLightMode ? 'text-slate-500' : 'text-white/50'}`}>
            Learn how to play and master the game
          </h3>

          {/* Content - Responsive padding */}
          <div className="w-full pt-6 sm:pt-10 flex flex-col gap-6 sm:gap-8">
            {/* Game Overview Card */}
            <div className={`group relative overflow-hidden backdrop-blur-3xl border-2 rounded-[2rem] p-6 sm:p-8 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 transition-all duration-700 text-left hover:-translate-y-1 hover:shadow-[0_30px_60px_rgba(6,182,212,0.15)] ${isLightMode ? 'bg-white/70 hover:bg-white/90 border-white/60' : 'bg-white/5 hover:bg-white/10 border-white/10'}`}>

              {/* Liquid Glow Inner */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div
                className="bg-cyan-500/10 border border-cyan-500/30 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/50 flex justify-center items-center rounded-2xl 
                w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex-shrink-0 transition-all duration-700 shadow-inner"
              >
                <img
                  src={Book}
                  alt="Book"
                  className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 group-hover:scale-110 transition-all duration-700 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)] ${isLightMode ? 'filter-none drop-shadow-md' : 'brightness-0 invert'}`}
                />
              </div>

              <div className="flex flex-col relative z-10">
                <p className={`text-xl sm:text-2xl lg:text-3xl font-black mb-2 tracking-tight transition-colors duration-1000 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                  Game Overview
                </p>
                <p className={`text-sm sm:text-base lg:text-lg font-medium leading-relaxed max-w-3xl transition-colors duration-1000 ${isLightMode ? 'text-slate-600' : 'text-white/70'}`}>
                  Lorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem Ipsum
                  Lorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem Ipsum
                  Lorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem Ipsum
                </p>
              </div>

              {/* Liquid Shine */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>

            {/* Group Setup Card */}
            <div className={`group relative overflow-hidden backdrop-blur-3xl border-2 rounded-[2rem] p-6 sm:p-8 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 transition-all duration-700 text-left hover:-translate-y-1 hover:shadow-[0_30px_60px_rgba(59,130,246,0.15)] ${isLightMode ? 'bg-white/70 hover:bg-white/90 border-white/60' : 'bg-white/5 hover:bg-white/10 border-white/10'}`}>

              {/* Liquid Glow Inner */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div
                className="bg-blue-500/10 border border-blue-500/30 group-hover:bg-blue-500/20 group-hover:border-blue-500/50 flex justify-center items-center rounded-2xl 
                w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex-shrink-0 transition-all duration-700 shadow-inner"
              >
                <img
                  src={People}
                  alt="People"
                  className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 group-hover:scale-110 transition-all duration-700 drop-shadow-[0_0_12px_rgba(59,130,246,0.6)] ${isLightMode ? 'filter-none drop-shadow-md' : 'brightness-0 invert'}`}
                />
              </div>

              <div className="flex flex-col relative z-10">
                <p className={`text-xl sm:text-2xl lg:text-3xl font-black mb-2 tracking-tight transition-colors duration-1000 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                  Group Set Up
                </p>
                <p className={`text-sm sm:text-base lg:text-lg font-medium leading-relaxed max-w-3xl transition-colors duration-1000 ${isLightMode ? 'text-slate-600' : 'text-white/70'}`}>
                  Lorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem IpsumLorem Ipsum
                  Lorem IpsumLorem IpsumLorem Ipsum
                </p>
              </div>

              {/* Liquid Shine */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          </div>
        </div>
      </div>
    </PageBackground>
  );
}

