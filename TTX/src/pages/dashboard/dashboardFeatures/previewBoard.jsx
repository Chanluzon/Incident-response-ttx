import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import CircularDropContainers from "../../../layouts/CircularDropContainers";
import DropContainers from "../../../layouts/dropContainers";
import CardContainer from "../../../layouts/cardcontainers";
import ContainerModal from "../../../layouts/containerModal.jsx";

import Board from "../../../images/lock.png";
import WorldtechLogo from "../../../images/Worldtech 2.png";
import AnimatedLogoBackground from "../../../layouts/AnimatedLogoBackground";

import GameBG from "../../../images/board-background.png";

// sample preview cards
const PREVIEW_CARDS = [
  {
    id: "preview-1",
    title: "Security Policy",
    category: "prepare",
    description: "Example of a company security policy",
  },
  {
    id: "preview-2",
    title: "Phishing and Spear-phishing",
    category: "recover",
    description: "Allow HTTPS outbound traffic",
  },
  {
    id: "preview-3",
    title: "Technology",
    category: "lessons learned",
    description: "Steps to respond to a breach",
  },
  {
    id: "preview-4",
    title: "Weak Passwords",
    category: "detect",
    description: "Steps to respond to a breach",
  },
  {
    id: "preview-5",
    title: "Hacktivists",
    category: "respond",
    description: "Steps to respond to a breach",
  },
];

export default function PreviewBoard() {
  const navigate = useNavigate();

  const [droppedCards, setDroppedCards] = useState({});
  const [isCardPanelOpen, setIsCardPanelOpen] = useState(false);
  const [openContainer, setOpenContainer] = useState(null);

  const previewThreat = "Preview Threat: Data Breach";

  return (
    <div className="relative w-screen min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 z-0" />
      
      {/* Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden z-0 opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[150px] animate-morph" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-cyan-600/20 rounded-full blur-[100px] animate-float [animation-delay:2s]" />
      </div>

      <div className="relative z-10 bg-white/10 backdrop-blur-md min-h-screen flex flex-col">
        {/* Animated Logo Background — above blur layers */}
        <AnimatedLogoBackground />

        {/* Top Navigation */}
        <div className="flex justify-between items-center pt-2 px-12 pb-2">
          {/* Logo Section */}
          <div className="flex items-center">
            <img src={WorldtechLogo} alt="Worldtech" className="h-8 md:h-12 lg:h-16 object-contain hover:scale-110 hover:-rotate-2 transition-all duration-300 cursor-pointer hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
          </div>

          <div className="flex items-center gap-4">
            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 md:text-sm
                      bg-white/70 backdrop-blur-xl
                      text-slate-700 font-medium
                      rounded-full shadow-md
                      hover:bg-white transition"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            {/* Header */}
            <h1
              className=" md:text-sm lg:text-lg font-bold tracking-tight
                    text-slate-800
                    bg-white/60 backdrop-blur-xl
                    border border-white/40
                    px-4 py-2 md:py-1  rounded-xl md:rounded-lg
                    shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
            >
              Preview Mode — No actions are saved
            </h1>
          </div>
        </div>


        {/* Scenario Info */}
        <div className="mb-2 mt-[-30px] md:mt-[-40px] flex flex-col items-center">
          <div className="bg-[#FFF9C4] border-2 border-[#F0E68C] rounded-xl shadow-md p-3 max-w-2xl w-full text-center">
            <h3 className="text-[#8B4513] font-bold text-xs uppercase tracking-wider mb-1">
              Scenario
            </h3>
            <p className="font-semibold text-slate-800 text-sm md:text-base">
              {previewThreat}
            </p>
          </div>
        </div>


        {/* Main Content */}
        <div className="flex-1 pb-12 mt-[-50px] md:mt-[-60px]">
          <CircularDropContainers
            droppedCards={droppedCards}
            setDroppedCards={setDroppedCards}
            onOpenContainer={setOpenContainer}
            showToast={() => {}}
            centerElement={
              <img
                src={Board}
                alt="Board Preview"
                className="w-full max-w-[50px] sm:max-w-[70px] md:max-w-[90px] lg:max-w-[110px] opacity-80 animate-breath"
              />
            }
          />

          {/* Drawer Handle */}
          {!isCardPanelOpen && (
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[60]">
              <button
                onClick={() => setIsCardPanelOpen(true)}
                className="group flex flex-col items-center justify-center px-12 py-3 md:px-20 md:py-4
                        bg-white/10 backdrop-blur-2xl border border-white/20 border-b-0 rounded-t-3xl
                        shadow-[0_-10px_40px_rgba(0,0,0,0.3)]
                        hover:bg-white/20 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
              >
                <div className="w-16 h-1.5 bg-white/40 rounded-full mb-2 group-hover:bg-yellow-400 group-hover:shadow-[0_0_10px_rgba(250,204,21,0.5)] transition-all duration-300" />
                <span className="text-white font-bold text-xs md:text-sm tracking-[0.2em] uppercase opacity-80 group-hover:opacity-100 transition-opacity">
                  Your Cards
                </span>
              </button>
            </div>
          )}
        </div>


      </div>

      {/* Card panel */}
      <CardContainer
        isOpen={isCardPanelOpen}
        toggleOpen={() => setIsCardPanelOpen(false)}
        preview
        previewCards={PREVIEW_CARDS}
      />

      {/* Container modal */}
      {openContainer && (
        <ContainerModal
          container={openContainer}
          cards={droppedCards[openContainer.id] || []}
          onClose={() => setOpenContainer(null)}
          onRemoveCard={(cardId) => {
            setDroppedCards((prev) => ({
              ...prev,
              [openContainer.id]: prev[openContainer.id].filter(
                (c) => c.card_id !== cardId,
              ),
            }));

            window.dispatchEvent(
              new CustomEvent("cardRestore", { detail: cardId }),
            );
          }}
        />
      )}
    </div>
  );
}
