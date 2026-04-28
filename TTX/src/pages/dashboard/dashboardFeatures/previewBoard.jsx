import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import DropContainers from "../../../layouts/dropContainers";
import CardContainer from "../../../layouts/cardcontainers";
import ContainerModal from "../../../layouts/containerModal.jsx";

import Board from "../../../images/Middle Board 1.png";
import GameBG from "../../../images/board-background.png";

// sample preview cards
const PREVIEW_CARDS = [
  {
    id: "preview-1",
    title: "Security Policy",
    category: "safeguard",
    description: "Example of a company security policy",
  },
  {
    id: "preview-2",
    title: "Phishing and Spear-phishing",
    category: "risk",
    description: "Allow HTTPS outbound traffic",
  },
  {
    id: "preview-3",
    title: "Technology",
    category: "infosec pillars",
    description: "Steps to respond to a breach",
  },
  {
    id: "preview-4",
    title: "Weak Passwords",
    category: "vulnerability",
    description: "Steps to respond to a breach",
  },
  {
    id: "preview-5",
    title: "Hacktivists",
    category: "threat agents",
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
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm scale-105 z-0"
        style={{ backgroundImage: `url(${GameBG})` }}
      />
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      <div className="relative z-10 bg-gray-100/20 min-h-screen flex flex-col">
        {/* Top Navigation */}
        <div className="flex justify-between items-center pt-6 px-12 pb-4">
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

        {/* Threat Info */}
        <div className=" mb-4">
          <p className="font-semibold text-lg md:text-lg lg:text-xl bg-green-800 text-white px-4 py-2 md:py-1">
            {previewThreat}
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1  pb-12">
          <div className="grid grid-cols-[260px_1fr_260px] gap-12 items-start">
            {/* Left Containers */}
            <div className="flex justify-end">
              <DropContainers
                side="left"
                droppedCards={droppedCards}
                setDroppedCards={setDroppedCards}
                onOpenContainer={setOpenContainer}
              />
            </div>

            {/* Board */}
            <div className="relative flex flex-col items-center justify-center gap-6 w-full">
              <img
                src={Board}
                alt="Board Preview"
                className="w-full max-w-sm md:max-w-2xl lg:max-w-5xl xl:max-w-6xl rounded-xl shadow-xl bg-white/10 object-contain"
              />

              <button
                onClick={() => setIsCardPanelOpen(true)}
                className="md:w-30 md:text-sm  lg:w-50 rounded-full font-semibold
                         bg-blue-700 hover:bg-blue-800
                         text-white transition"
              >
                Add Card
              </button>
            </div>

            {/* Right Containers */}
            <div className="flex flex-col items-start gap-6">
              <DropContainers
                side="right"
                droppedCards={droppedCards}
                setDroppedCards={setDroppedCards}
                onOpenContainer={setOpenContainer}
              />
            </div>
          </div>
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
