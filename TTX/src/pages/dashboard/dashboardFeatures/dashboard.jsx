import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import Book from "../../../images/book.png";
import Flash from "../../../images/flash.png";
import DashBG from "../../../images/auth-background.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);

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
    <div className="relative w-screen min-h-screen overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm scale-105 z-0"
        style={{ backgroundImage: `url(${DashBG})` }}
      />

      <div
        className="relative z-10 text-black min-h-screen p-3 sm:p-4 md:p-5 lg:p-10 overflow-hidden bg-white/20 backdrop-blur-sm flex flex-col"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.45) 100%)",
        }}
      >
        {/* Back Button */}
        <button
          onClick={() => navigate("/SetUp")}
          className="absolute top-3 sm:top-4 md:top-4 lg:top-6 left-3 sm:left-4 md:left-4 lg:left-6
            flex items-center gap-1 sm:gap-1.5 md:gap-2
            px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full
            bg-white/70 backdrop-blur-xl
            text-slate-700 font-medium text-xs sm:text-sm md:text-base
            shadow-md
            hover:bg-white transition"
        >
          <ArrowLeft
            size={14}
            className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]"
          />
          <span className="hidden sm:inline">Back</span>
        </button>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Group Name Section */}
          <div className="text-center mb-2 sm:mb-3 md:mb-4 lg:mb-10">
            <div className="text-lg sm:text-xl md:text-xl lg:text-2xl font-medium text-black pb-1">
              <h2>WELCOME!</h2>
            </div>

            <div
              className="inline-block 
                text-xl sm:text-2xl md:text-2xl lg:text-4xl font-bold tracking-tight
                text-slate-800
                bg-white
                border border-white/30
                px-4 sm:px-5 md:px-6 lg:px-8 
                py-2 sm:py-2 md:py-2 lg:py-4 
                rounded-2xl sm:rounded-2xl md:rounded-2xl lg:rounded-3xl
                shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
            >
              <h1 className="text-yellow-400 [-webkit-text-stroke:1px_red]">
                Team {group ? group.group_name : "Loading group..."}
              </h1>
            </div>

            <div className="text-base sm:text-lg md:text-lg lg:text-2xl font-medium text-black pt-1">
              <h2>Ready to begin your adventure?</h2>
            </div>
          </div>

          {/* Buttons Container */}
          <div className="w-full max-w-3xl px-2 sm:px-3 md:px-4 lg:px-10">
            {/* Game Instructions */}
            <div className="pt-2 sm:pt-3 md:pt-4 lg:pt-15">
              <button
                onClick={instructionsHandler}
                className="bg-white/70 backdrop-blur-xl hover:bg-gray-100 hover:text-black 
                  rounded-full w-full 
                  h-auto sm:h-20 md:h-20 lg:h-30 
                  shadow-md shadow-black 
                  text-base sm:text-lg md:text-xl lg:text-3xl font-bold 
                  text-left flex 
                  p-2 sm:p-2 md:p-2 lg:p-4"
              >
                <div
                  className="bg-green-300 flex items-center justify-center 
                    rounded-full 
                    w-10 h-10 sm:w-12 sm:h-12 md:w-12 md:h-12 lg:w-20 lg:h-20 
                    flex-shrink-0"
                >
                  <img
                    src={Book}
                    alt="Book"
                    className="w-6 h-6 sm:w-8 sm:h-8 md:w-8 md:h-8 lg:w-15 lg:h-15"
                  />
                </div>
                <div className="flex flex-col justify-center pl-2 sm:pl-3 md:pl-3 lg:pl-10 min-w-0">
                  <span className="text-sm sm:text-base md:text-lg lg:text-4xl truncate">
                    Game Instructions
                  </span>
                  <span className="text-xs sm:text-xs md:text-sm lg:text-2xl text-gray-600 truncate">
                    Learn how to play and understand the rules
                  </span>
                </div>
              </button>
            </div>

            {/* Join Game */}
            <div className="pt-2 sm:pt-3 md:pt-3 lg:pt-10">
              <button
                onClick={joinGameHandler}
                className="bg-white/70 backdrop-blur-xl hover:bg-gray-100 hover:text-black 
                  rounded-full w-full 
                  h-auto sm:h-20 md:h-20 lg:h-30 
                  shadow-md shadow-black 
                  text-base sm:text-lg md:text-xl lg:text-3xl font-bold 
                  text-left flex 
                  p-2 sm:p-2 md:p-2 lg:p-4"
              >
                <div
                  className="bg-red-300 flex items-center justify-center 
                    rounded-full 
                    w-10 h-10 sm:w-12 sm:h-12 md:w-12 md:h-12 lg:w-20 lg:h-20 
                    flex-shrink-0"
                >
                  <img
                    src={Flash}
                    alt="Flash"
                    className="w-6 h-6 sm:w-8 sm:h-8 md:w-8 md:h-8 lg:w-15 lg:h-15"
                  />
                </div>
                <div className="flex flex-col justify-center pl-2 sm:pl-3 md:pl-3 lg:pl-10 min-w-0">
                  <span className="text-sm sm:text-base md:text-lg lg:text-4xl truncate">
                    Join Game
                  </span>
                  <span className="text-xs sm:text-xs md:text-sm lg:text-2xl text-gray-600 truncate">
                    Enter code to join the game
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
