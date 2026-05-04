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
      image: rawCard.image,
    };

    // category must match
    if (card.category !== container.category) return;

    const existingCards = droppedCards[container.id] || [];
    const limit = CONTAINER_LIMITS[container.category] ?? 4;

    if (existingCards.length >= limit) {
      showToast(
        container.category === "lessons learned"
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
              className={`drop-target relative  w-44 h-16 sm:w-48 sm:h-20 md:w-52 md:h-20 lg:w-56 lg:h-28 xl:w-60 xl:h-32 rounded-2xl 
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
              {/* Icon and Title */}
              <div className="flex flex-col items-center justify-center p-2">
                <span className="font-semibold text-xs sm:text-sm md:text-base leading-tight">
                  {container.title}
                </span>
                <img 
                  src={CATEGORY_ICONS[container.category]} 
                  alt={container.title}
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 mt-1 object-contain"
                />
              </div>

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
                  {container.category === "lessons learned"
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
