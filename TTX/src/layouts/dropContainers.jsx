import React from "react";
import { dropContainers } from "./dropContainers.config";

const CONTAINER_LIMITS = {
  "infosec pillars": 1,
  safeguard: 4,
  vulnerability: 3,
  "threat agents": 4,
  risk: 4,
};

const LIMIT_BADGE_COLORS = {
  safeguard: "bg-yellow-200 text-yellow-900",
  vulnerability: "bg-blue-200 text-blue-900",
  "threat agents": "bg-orange-200 text-orange-900",
  risk: "bg-red-200 text-red-900",
  "infosec pillars": "bg-purple-200 text-purple-800",
};

export default function DropContainers({
  side = "left",
  droppedCards = {},
  setDroppedCards,
  onOpenContainer,
  showToast,
  locked = false,
  onCardPlaced,
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
    };

    // category must match
    if (card.category !== container.category) return;

    const existingCards = droppedCards[container.id] || [];
    const limit = CONTAINER_LIMITS[container.category] ?? 4;

    if (existingCards.length >= limit) {
      showToast(
        container.category === "infosec pillars"
          ? "Only one InfoSec Pillar card is allowed in this container."
          : `You’ve reached the limit (${limit} cards).`,
        "warning"
      );
      return;
    }

    setDroppedCards((prev) => ({
      ...prev,
      [container.id]: [...existingCards, card],
    }));

    if (onCardPlaced) {
      onCardPlaced(card.card_id);
    }

    window.dispatchEvent(
      new CustomEvent("cardDrop", { detail: card.card_id })
    );

  };

  const leftIds = [1, 2, 3];
  const rightIds = [4, 5];

  const visibleContainers =
    side === "left"
      ? dropContainers.filter((c) => leftIds.includes(c.id))
      : dropContainers.filter((c) => rightIds.includes(c.id));

  return (
    <div className="flex flex-col gap-5 ">
      {visibleContainers.map((container) => {
        const count = droppedCards[container.id]?.length || 0;
        const limit = CONTAINER_LIMITS[container.category] ?? 4;
        const isFull = count >= limit;

        return (
          <div
            key={container.id}
            onClick={() => {
              onOpenContainer(container);
              }}
              onDrop={(e) => onDrop(e, container)}
              onDragOver={allowDrop}
              className={`relative  w-44 h-16 sm:w-48 sm:h-20 md:w-52 md:h-20 lg:w-56 lg:h-28 xl:w-60 xl:h-32 rounded-2xl 
                flex items-center justify-center text-center  
                border shadow-[0_0_20px_rgba(180,180,180,0.55)]
                transition-all duration-300
                
                ${
                locked
                  ? "bg-gray-300 text-gray-600 border-gray-400 cursor-not-allowed grayscale opacity-75"
                  : `${container.bg} ${container.text} ${container.border} cursor-pointer hover:shadow-[0_0_30px_rgba(255,255,255,0.85)]`
                }
              `}
              >
              {/* Title */}
            <span className="font-semibold text-xs sm:text-sm md:text-base lg:text-lg px-2 sm:px-3 leading-tight">
              {container.title}
            </span>

            {/* Count badge */}
            <div
              className={`absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full
                text-[10px] sm:text-xs md:text-sm font-bold flex items-center justify-center shadow
                ${
                  locked
                    ? "bg-gray-400 text-gray-700"
                    : LIMIT_BADGE_COLORS[container.category] ||
                      "bg-gray-200 text-gray-800"
                }
              `}
            >
              {count}
            </div>

            {/* Limit message */}
            {isFull && (
              <div className="absolute bottom-1 sm:bottom-2 left-1/2 -translate-x-1/2">
                <p
                  className={`text-[8px] sm:text-[10px]  md:w-30 md:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full
                    ${
                      locked
                        ? "bg-gray-400 text-gray-700"
                        : LIMIT_BADGE_COLORS[container.category] ||
                          "bg-gray-200 text-gray-800"
                    }`}
                >
                  {container.category === "infosec pillars"
                    ? "Only one allowed"
                    : `Limit reached (${limit})`}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
