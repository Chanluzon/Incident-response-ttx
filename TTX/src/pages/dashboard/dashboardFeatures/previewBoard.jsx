import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import PageBackground from "../../../components/PageBackground";

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
  const { isLightMode } = useTheme();

  const [droppedCards, setDroppedCards] = useState({});
  const [isCardPanelOpen, setIsCardPanelOpen] = useState(false);
  const [openContainer, setOpenContainer] = useState(null);

  const previewThreat = "Preview Threat: Data Breach";

  return (
    <PageBackground>
      <div className={`relative z-10 min-h-screen flex flex-col transition-colors duration-1000 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
        {/* Animated Logo Background — above blur layers */}
        <AnimatedLogoBackground />

        {/* Top Navigation */}
        <div className="flex justify-between items-center pt-2 px-6 sm:px-12 pb-2">
          {/* Logo + Back Button Section */}
          <div className="flex items-center gap-4">
            <img src={WorldtechLogo} alt="Worldtech" className="h-8 md:h-12 lg:h-16 object-contain hover:scale-110 hover:-rotate-2 transition-all duration-300 cursor-pointer hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />

            {/* Back button — beside logo */}
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full
                backdrop-blur-xl border transition-all duration-300 group shadow-lg hover:-translate-x-1
                ${isLightMode
                  ? 'bg-white/50 hover:bg-white/80 border-slate-300 text-slate-600 hover:text-slate-900 shadow-[0_0_20px_rgba(0,0,0,0.05)]'
                  : 'bg-white/5 hover:bg-white/15 border-white/10 hover:border-white/30 text-white/80 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                }`}
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
              Back
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Header */}
            <h1
              className={`text-sm lg:text-lg font-bold tracking-tight px-4 py-2 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] backdrop-blur-xl border transition-colors duration-1000
                    ${isLightMode
                  ? 'bg-white/60 text-slate-800 border-white/40'
                  : 'bg-slate-900/40 text-white border-white/10'}`}
            >
              Preview Mode — No actions are saved
            </h1>
          </div>
        </div>


        {/* Scenario Info */}
        <div className="mb-2 mt-[-30px] md:mt-[-40px] flex flex-col items-center">
          <div className={`rounded-xl shadow-md p-3 max-w-2xl w-full text-center border-2 transition-colors duration-1000
                        ${isLightMode
              ? 'bg-amber-50 border-amber-200'
              : 'bg-white/10 border-white/20 backdrop-blur-xl'}`}>
            <h3 className={`font-bold text-xs uppercase tracking-wider mb-1 transition-colors duration-1000 ${isLightMode ? 'text-amber-700' : 'text-amber-400'}`}>
              Scenario
            </h3>
            <p className={`font-semibold text-sm md:text-base transition-colors duration-1000 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
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
            showToast={() => { }}
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
                className={`group flex flex-col items-center justify-center px-12 py-3 md:px-20 md:py-4
                          backdrop-blur-2xl border border-b-0 rounded-t-3xl
                          shadow-[0_-10px_40px_rgba(0,0,0,0.3)]
                          hover:-translate-y-2 transition-all duration-300 cursor-pointer
                          ${isLightMode ? 'bg-white/60 hover:bg-white/80 border-slate-300' : 'bg-white/10 hover:bg-white/20 border-white/20'}`}
              >
                <div className={`w-16 h-1.5 rounded-full mb-2 transition-all duration-300 ${isLightMode ? 'bg-slate-300 group-hover:bg-blue-500 group-hover:shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'bg-white/40 group-hover:bg-yellow-400 group-hover:shadow-[0_0_10px_rgba(250,204,21,0.5)]'}`} />
                <span className={`font-bold text-xs md:text-sm tracking-[0.2em] uppercase opacity-80 group-hover:opacity-100 transition-opacity ${isLightMode ? 'text-slate-600' : 'text-white'}`}>
                  Your E-Cards
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
    </PageBackground>
  );
}

