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
      <div className={`relative z-10 w-full min-h-screen overflow-auto p-4 sm:p-6 md:p-8 lg:p-10 backdrop-blur-md flex flex-col items-center transition-colors duration-1000 ${isLightMode ? 'bg-white/30' : 'bg-white/10'}`}>
        {/* Back Button */}
        <div className="w-full max-w-5xl relative z-20">
          <button
            onClick={backToDashboard}
            className={`flex items-center gap-2
            px-4 lg:px-5 py-2 lg:py-2.5 rounded-full
            backdrop-blur-xl border transition-all duration-300 group w-fit shadow-lg
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
            <span className="tracking-wide">Back to Dashboard</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center pt-8 sm:pt-10 md:pt-12 pb-8 sm:pb-10 font-medium w-full max-w-5xl">
          <p className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br tracking-tight transition-colors duration-1000 mb-3 ${isLightMode ? 'from-slate-800 to-slate-500 drop-shadow-sm' : 'from-white to-white/70 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]'}`}>
            Game Instructions
          </p>
          <h3 className={`text-base sm:text-lg md:text-xl lg:text-2xl font-medium tracking-wide transition-colors duration-1000 ${isLightMode ? 'text-slate-500' : 'text-white/50'}`}>
            Learn how to play and master the game
          </h3>

          {/* Content - Responsive padding */}
          <div className="w-full pt-4 sm:pt-8 flex flex-col gap-6 sm:gap-8">
            {/* Game Overview Card */}
            <div className={`backdrop-blur-2xl border rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 transition-colors duration-500 text-left ${isLightMode ? 'bg-white/60 hover:bg-white/80 border-slate-300' : 'bg-white/5 hover:bg-white/10 border-white/10'}`}>
              <div
                className="bg-cyan-500/20 border border-cyan-500/50 flex justify-center items-center rounded-2xl 
                w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex-shrink-0"
              >
                <img
                  src={Book}
                  alt="Book"
                  className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] ${isLightMode ? 'filter-none drop-shadow-md' : 'brightness-0 invert'}`}
                />
              </div>

              <div className="flex flex-col">
                <p className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 transition-colors duration-1000 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                  Game Overview
                </p>
                <p className={`text-sm sm:text-base lg:text-lg font-medium leading-relaxed max-w-3xl transition-colors duration-1000 ${isLightMode ? 'text-slate-600' : 'text-white/70'}`}>
                  Put the correct cards to each category. Drag and drop each correct
                  cards to the container that matches the color. Some of the
                  instructions will be demoed by the game master.
                </p>
              </div>
            </div>

            {/* Group Setup Card */}
            <div className={`backdrop-blur-2xl border rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 transition-colors duration-500 text-left ${isLightMode ? 'bg-white/60 hover:bg-white/80 border-slate-300' : 'bg-white/5 hover:bg-white/10 border-white/10'}`}>
              <div
                className="bg-blue-500/20 border border-blue-500/50 flex justify-center items-center rounded-2xl 
                w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex-shrink-0"
              >
                <img
                  src={People}
                  alt="People"
                  className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] ${isLightMode ? 'filter-none drop-shadow-md' : 'brightness-0 invert'}`}
                />
              </div>

              <div className="flex flex-col">
                <p className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 transition-colors duration-1000 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                  Group Set Up
                </p>
                <p className={`text-sm sm:text-base lg:text-lg font-medium leading-relaxed max-w-3xl transition-colors duration-1000 ${isLightMode ? 'text-slate-600' : 'text-white/70'}`}>
                  Choose the leader that you think has more knowledge on how to
                  assess, defend and identify threats.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageBackground>
  );
}

