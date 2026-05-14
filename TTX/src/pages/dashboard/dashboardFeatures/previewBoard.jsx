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
import LiquidButton from "../../../components/LiquidButton";
import FormattedDescription from "../../../components/FormattedDescription";
import { X } from "lucide-react";


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
  const [showFullScenario, setShowFullScenario] = useState(false);

  const previewThreat = "Preview Threat: Data Breach. This is a sample scenario to demonstrate the board layout.";


  return (
    <PageBackground>
      <div className={`relative z-10 min-h-screen flex flex-col transition-colors duration-1000 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
        {/* Animated Logo Background — above blur layers */}
        <AnimatedLogoBackground />

        {/* Top Navigation */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 px-6 md:px-10 pt-4 pb-4">
          {/* Logo + Back Button Section */}
          <div className="flex items-center gap-4">
            <img 
              src={WorldtechLogo} 
              alt="Worldtech" 
              className={`h-10 md:h-14 lg:h-20 object-contain hover:scale-110 hover:-rotate-2 transition-all duration-500 cursor-pointer ${isLightMode ? 'logo-glow-light' : 'logo-glow'} hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]`} 
            />

            <button
              onClick={() => navigate(-1)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full
                backdrop-blur-xl border transition-all duration-300 group shadow-lg hover:-translate-x-1
                ${isLightMode
                  ? 'bg-white/50 hover:bg-white/80 border-slate-300 text-slate-600 hover:text-slate-900 shadow-[0_0_20px_rgba(0,0,0,0.05)]'
                  : 'bg-white/5 hover:bg-white/15 border-white/10 hover:border-white/30 text-white/80 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                }`}
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className={`font-black lg:text-xl md:text-lg backdrop-blur-3xl border-2 lg:rounded-[1.5rem] md:rounded-2xl px-6 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-20 tracking-[0.2em] uppercase transition-all duration-1000 ${isLightMode ? 'bg-white/70 text-slate-800 border-white/60' : 'bg-white/5 text-white border-white/10'}`}>
              PREVIEW
            </div>

            <div className={`border-2 lg:rounded-[1.5rem] md:rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] z-20 transition-all duration-500 ${isLightMode ? "bg-white/70 border-white/60 backdrop-blur-3xl" : "bg-white/10 border-white/10 backdrop-blur-3xl"}`}>
              <div className={`px-6 py-3 font-mono font-black lg:text-xl md:text-xl rounded-xl tracking-[0.2em] transition-colors ${isLightMode ? "text-slate-800" : "text-amber-400"}`}>
                00:00
              </div>
            </div>
          </div>
        </div>



        {/* Scenario Info */}
        <div className="mb-4 mt-[-40px] px-4 flex flex-col items-center relative z-20">
          <div
            onClick={() => setShowFullScenario(true)}
            className={`backdrop-blur-3xl border-2 rounded-[2rem] shadow-[0_20px_60px_rgba(239,68,68,0.2)] px-6 py-3 w-[300px] h-[100px] flex flex-col justify-center items-center text-center relative overflow-hidden group transition-all duration-700 cursor-pointer hover:scale-[1.03] active:scale-[0.97] ${isLightMode ? 'bg-red-50/90 border-red-200 hover:bg-red-100/95' : 'bg-red-500/10 border-red-500/40 hover:bg-red-500/20'}`}>

            {/* Liquid Glow Accent */}
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${isLightMode ? 'from-transparent via-red-400/40 to-transparent' : 'from-transparent via-red-400/40 to-transparent'} opacity-50`} />

            <h3 className={`font-black text-xs uppercase tracking-[0.4em] mb-2 transition-colors ${isLightMode ? 'text-red-600' : 'text-red-400'}`}>
              Target Scenario
            </h3>

            <p
              className={`font-black text-base md:text-lg leading-relaxed tracking-tight transition-colors ${isLightMode ? 'text-slate-800' : 'text-white'}`}
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {previewThreat}
            </p>

            <div className="mt-2 text-[10px] font-bold tracking-[0.2em] uppercase opacity-0 group-hover:opacity-40 transition-opacity flex items-center justify-center gap-2">
              <div className="w-1 h-1 rounded-full bg-current animate-ping" />
              Click to enlarge
            </div>
          </div>
        </div>



        {/* Main Content */}
        <div className="flex-1 pb-12 mt-[-60px] md:mt-[-80px]">

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
                className={`group flex flex-col items-center justify-center px-10 py-3 sm:px-14 sm:py-4 md:px-16 md:py-5 lg:px-20 lg:py-6
                          backdrop-blur-[40px] border-2 border-b-0 rounded-t-[3rem]
                          shadow-[0_-20px_60px_rgba(0,0,0,0.4)]
                          hover:-translate-y-3 transition-all duration-700 cursor-pointer
                          ${isLightMode ? 'bg-white/80 hover:bg-white border-white/60' : 'bg-slate-900/40 hover:bg-slate-900/60 border-white/10'}`}
              >
                {/* Moving indicator */}
                <div className={`w-20 h-1.5 rounded-full mb-3 transition-all duration-700 overflow-hidden relative ${isLightMode ? 'bg-slate-200' : 'bg-white/10'}`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent translate-x-[-100%] animate-shimmer" />
                </div>
                <span className={`font-black text-xs md:text-sm tracking-[0.4em] uppercase opacity-70 group-hover:opacity-100 transition-opacity ${isLightMode ? 'text-slate-600' : 'text-white'}`}>
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
      {/* Full Scenario Modal */}
      {showFullScenario && (
        <div className={`fixed inset-0 z-[400] flex items-center justify-center p-4 animate-in fade-in duration-500 ${isLightMode ? 'bg-slate-100/70 backdrop-blur-md' : 'bg-slate-950/90'}`}>
          <div className={`backdrop-blur-[50px] border-2 rounded-[3rem] p-10 shadow-[0_50px_120px_rgba(0,0,0,0.6)] text-center w-full max-w-4xl relative overflow-hidden transition-all duration-700 ${isLightMode ? 'bg-white/95 border-white/80' : 'bg-slate-900/90 border-white/10'}`}>
            <div className={`relative z-10 w-full ${previewThreat.length < 120 ? 'text-center' : 'text-left'}`}>
              <h3 className={`font-black text-xs uppercase tracking-[0.6em] mb-8 transition-colors ${isLightMode ? 'text-slate-400' : 'text-amber-400/60'} ${previewThreat.length < 120 ? 'text-center' : 'text-left'}`}>
                TARGET SCENARIO
              </h3>

              <div className={`p-8 rounded-[2rem] mb-10 transition-all duration-500 shadow-inner h-[450px] overflow-y-auto custom-scrollbar ${isLightMode ? 'bg-slate-50 border-2 border-slate-100' : 'bg-white/5 border-2 border-white/10'}`}>
                <p className={`text-xl md:text-2xl font-black leading-relaxed tracking-tight transition-colors ${isLightMode ? 'text-slate-800' : 'text-white'} ${previewThreat.length < 120 ? 'text-center' : 'text-left'}`}>
                  <FormattedDescription description={previewThreat} />
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setShowFullScenario(false)}
                  className={`px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all duration-500 active:scale-95 border-2 ${isLightMode ? 'bg-slate-900 border-white/10 text-white hover:bg-slate-800' : 'bg-white border-white text-slate-900 hover:bg-slate-100'}`}
                >
                  RETURN
                </button>
              </div>
            </div>

            {/* Liquid accent */}
            <div className={`absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r ${isLightMode ? 'from-blue-500 via-indigo-500 to-cyan-500' : 'from-blue-600 via-indigo-600 to-cyan-600'} opacity-50`} />
          </div>
        </div>
      )}
    </PageBackground>

  );
}

