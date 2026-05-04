import React from "react";
import { dropContainers } from "./dropContainers.config";
import prepareImg from "../images/prepare.png";
import detectImg from "../images/detect.png";
import respondImg from "../images/respond.png";
import recoverImg from "../images/recover.png";
import lessonsImg from "../images/lesson learned.png";

const CATEGORY_ICONS = {
  prepare: prepareImg,
  detect: detectImg,
  "respond": respondImg,
  recover: recoverImg,
  "lessons learned": lessonsImg,
};

const CONTAINER_LIMITS = {
  "lessons learned": 1,
  prepare: 4,
  detect: 3,
  "respond": 4,
  recover: 4,
};

const LIMIT_BADGE_COLORS = {
  prepare: "bg-[#4DA8AF] text-white",
  detect: "bg-[#D4C800] text-yellow-900",
  "respond": "bg-[#E87EA1] text-white",
  recover: "bg-[#28A428] text-white",
  "lessons learned": "bg-[#E6952D] text-white",
};

export function DropContainerItem({
  container,
  count,
  locked,
  onOpenContainer,
  onDrop,
  allowDrop,
}) {
  const limit = CONTAINER_LIMITS[container.category] ?? 4;
  const isFull = count >= limit;

  return (
    <div
      onClick={() => onOpenContainer(container)}
      onDrop={(e) => onDrop(e, container)}
      onDragOver={allowDrop}
      className={`relative w-32 h-14 sm:w-40 sm:h-18 md:w-48 md:h-22 lg:w-56 lg:h-26 rounded-xl 
        flex flex-col items-center justify-center text-center p-2
        border shadow-lg transition-all duration-300
        ${locked
          ? "bg-gray-300 text-gray-600 border-gray-400 cursor-not-allowed grayscale opacity-75"
          : `${container.bg} ${container.text} ${container.border} cursor-pointer hover:scale-105 hover:shadow-2xl`
        }
      `}
    >
      <span className="font-bold text-[8px] sm:text-[10px] md:text-xs lg:text-sm leading-tight uppercase">
        {container.title}
      </span>
      <img
        src={CATEGORY_ICONS[container.category]}
        alt={container.title}
        className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 mt-1 object-contain"
      />



      <div
        className={`absolute bottom-2 right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full
          text-xs font-bold flex items-center justify-center shadow-inner
          ${locked
            ? "bg-gray-400 text-gray-700"
            : LIMIT_BADGE_COLORS[container.category] || "bg-gray-200 text-gray-800"
          }
        `}
      >
        {count}
      </div>

      {isFull && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <p className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm
            ${locked ? "bg-gray-400 text-gray-700" : LIMIT_BADGE_COLORS[container.category]}`}>
            {container.category === "lessons learned" ? "Max 1" : "FULL"}
          </p>
        </div>
      )}
    </div>
  );
}

export default function CircularDropContainers({
  droppedCards = {},
  setDroppedCards,
  onOpenContainer,
  showToast,
  locked = false,
  onCardPlaced,
  centerElement,
}) {
  const allowDrop = (e) => {
    if (!locked) e.preventDefault();
  };

  const onDrop = (e, container) => {
    if (locked) return;
    e.preventDefault();

    const data = e.dataTransfer.getData("application/json");
    if (!data) return;

    const rawCard = JSON.parse(data);
    const card = {
      card_id: rawCard.card_id ?? rawCard.id,
      card_name: rawCard.card_name ?? rawCard.title,
      category: rawCard.category,
      description: rawCard.description,
      image: rawCard.image,
    };

    if (card.category !== container.category) return;

    const existingCards = droppedCards[container.id] || [];
    const limit = CONTAINER_LIMITS[container.category] ?? 4;

    if (existingCards.length >= limit) {
      showToast(
        container.category === "lessons learned"
          ? "Only one card allowed."
          : `Limit reached (${limit} cards).`,
        "warning"
      );
      return;
    }

    setDroppedCards((prev) => ({
      ...prev,
      [container.id]: [...existingCards, card],
    }));

    if (onCardPlaced) onCardPlaced(card.card_id);
    window.dispatchEvent(new CustomEvent("cardDrop", { detail: card.card_id }));
  };

  // Map containers to positions
  // 1: Prepare, 2: Detect, 3: Respond, 4: Recover, 5: Lessons Learned
  const positions = {
    1: "top-[9%] right-[0%] sm:right-[5%] md:right-[10%]", // Prepare
    2: "bottom-[32%] right-[0%] sm:right-[5%] md:right-[10%]", // Detect
    3: "bottom-[5%] left-1/2 -translate-x-1/2", // Respond
    4: "bottom-[32%] left-[0%] sm:left-[5%] md:left-[10%]", // Recover
    5: "top-[9%] left-[0%] sm:left-[5%] md:left-[10%]", // Lessons Learned
  };

  return (
    <div className="relative w-full max-w-4xl aspect-[4/3] sm:aspect-video flex items-center justify-center my-4 mx-auto scale-75 sm:scale-85">
      {/* Center Image */}
      <div className="z-10 scale-110 -translate-y-12">
        {centerElement}
      </div>

      {/* Circular Containers */}
      <div className="absolute inset-0 pointer-events-none">
        {dropContainers.map((container) => (
          <div
            key={container.id}
            className={`absolute pointer-events-auto transition-all duration-500 ${positions[container.id]}`}
          >
            <DropContainerItem
              container={container}
              count={droppedCards[container.id]?.length || 0}
              locked={locked}
              onOpenContainer={onOpenContainer}
              onDrop={onDrop}
              allowDrop={allowDrop}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
