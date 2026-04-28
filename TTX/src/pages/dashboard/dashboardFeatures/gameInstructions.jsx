import React from "react";
import { useNavigate } from "react-router-dom";

// Icons
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Images
import Book from "../../../images/book.png";
import People from "../../../images/people.png";

export default function GameInstructions() {
  const navigate = useNavigate();

  // Navigation Handler
  const backToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="bg-white text-black w-screen min-h-screen overflow-auto p-4 sm:p-6 md:p-8 lg:p-10">
      {/* Back Button */}
      <div className="pt-2 sm:pt-3 md:pt-4 lg:pt-5">
        <button
          onClick={backToDashboard}
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-black cursor-pointer flex items-center gap-1 sm:gap-2"
        >
          <FontAwesomeIcon
            icon={faChevronLeft}
            className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5"
          />
          <span>Back to Game Menu</span>
        </button>
      </div>

      {/* Header */}
      <div className="text-center pt-3 sm:pt-4 md:pt-5 lg:pt-5 pb-4 sm:pb-6 md:pb-8 lg:pb-10 font-medium">
        <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-green-900">
          Game Instructions
        </p>
        <h3 className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mt-1 sm:mt-2">
          Learn how to play and master the game
        </h3>

        {/* Content - Responsive padding */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 pt-4 sm:pt-8 md:pt-12 lg:pt-16 xl:pt-20">
          {/* Game Overview */}
          <div className="flex flex-row items-center">
            <div
              className="flex justify-center items-center bg-green-300 rounded-xl 
                w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-17 xl:h-17"
            >
              <img
                src={Book}
                alt="Book"
                className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12"
              />
            </div>
            <p className="pl-2 sm:pl-3 md:pl-4 lg:pl-5 text-green text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">
              Game Overview
            </p>
          </div>

          <div className="px-2 sm:px-4 md:px-8 lg:px-12 xl:px-25 font-medium text-left pt-2 sm:pt-3 md:pt-4 lg:pt-5">
            <p className="text-xs text-green-700 sm:text-sm md:text-base lg:text-lg xl:text-2xl text-justify">
              Put the correct cards to each category. Drag and drop each correct
              cards to the container that matches the color. Some of the
              instructions will be demo by the game master.
            </p>
          </div>

          {/* Group Setup */}
          <div className="flex flex-row items-center pt-4 sm:pt-6 md:pt-8 lg:pt-10">
            <div
              className="flex justify-center items-center bg-green-300 rounded-xl 
                w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-17 xl:h-17"
            >
              <img
                src={People}
                alt="People"
                className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12"
              />
            </div>
            <p className="pl-2 sm:pl-3 md:pl-4 lg:pl-5 text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">
              Group Set Up
            </p>
          </div>

          <div className="px-2 sm:px-4 md:px-8 lg:px-12 xl:px-25 font-medium text-left pt-2 sm:pt-3 md:pt-4 lg:pt-5">
            <p className="text-xs sm:text-sm md:text-base text-green-700 text-justify lg:text-lg xl:text-2xl">
              Choose the leader that you think has more knowledge on how to
              assess, defend and indentify threat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
