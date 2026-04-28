import React, { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import { apiUrl } from "../config/api";

// category config
const CATEGORIES = [
  { key: "all", label: "All", color: "bg-gray-400" },
  { key: "safeguard", label: "Safeguards", color: "bg-yellow-400" },
  { key: "vulnerability", label: "Vulnerabilities", color: "bg-blue-400" },
  { key: "threat agents", label: "Threat Agents", color: "bg-orange-400" },
  { key: "risk", label: "Risks", color: "bg-red-400" },
  { key: "infosec pillars", label: "InfoSec Pillars", color: "bg-purple-400" },
];

const CATEGORY_DESCRIPTIONS = {
  safeguard:
    "Protective measures (policies, procedures, or technologies) implemented to prevent, detect, or mitigate security risks and protect assets.",
  vulnerability:
    "Weaknesses, flaws, or gaps in an information system, security procedures, internal controls, or implementation that could be exploited by a threat.",
  "threat agents":
    "Individuals, groups, or entities (internal or external) that have the potential to exploit a vulnerability and cause harm to an organization's assets.",
  risk: "The potential for loss, damage, or destruction of an asset as a result of a threat exploiting a vulnerability; often measured as Impact × Likelihood.",
  "infosec pillars":
    "The core principles of information security, commonly known as the CIA Triad: Confidentiality, Integrity, and Availability.",
};

function CardItem({ card, preview, onTouchStart }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const id = preview ? card.id : card.card_id;
  const title = preview ? card.title : card.card_name;
  const description =
    card.description || CATEGORY_DESCRIPTIONS[card.category] || "";

  return (
    <div
      className={`card-flip-container ${isFlipped ? "is-flipped" : ""}
        w-[130px] sm:w-[140px] md:w-[150px] lg:w-[160px]
        h-[145px] sm:h-[160px] md:h-[170px] lg:h-[180px]
        hover:-translate-y-2 transition-transform duration-300 ease-out`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="card-flip-inner shadow-md hover:shadow-xl">
        {/* Front */}
        <div
          draggable={!isFlipped}
            onDragStart={(e) => {
              if (isFlipped) return;
              e.dataTransfer.setData(
                "application/json",
                JSON.stringify({
                  id,
                  title,
                  category: card.category,
                  description: description,
                }),
              );
            }}
          onTouchStart={(e) => !isFlipped && onTouchStart(e, card)}
          className={`card-flip-front border p-3 sm:p-4 text-xs sm:text-sm select-none ${getCardColor(
            card.category,
          )}`}
        >
          <h3 className="font-semibold text-sm leading-tight text-center">
            {title}
          </h3>
        </div>

        {/* Back */}
        <div
          className={`card-flip-back border text-[10px] leading-tight select-none ${getCardColor(
            card.category,
          )}`}
        >
          <p className="italic">{description}</p>
        </div>
      </div>
    </div>
  );
}

const getCardColor = (cat) => {
  switch (cat) {
    case "safeguard":
      return "border-3 bg-linear-to-br from-[#FFEC5C] via-[#FFDE21] to-[#E5C71E] text-green border-[#C9AA12] shadow-black-500/20";
    case "vulnerability":
      return "border-3 bg-linear-to-br from-[#3A7BD5] via-[#295794] to-[#1B3B66] text-white border-[#244E85] shadow-blue-500/20";
    case "threat agents":
      return "border-3 bg-linear-to-br from-[#FFB84D] via-[#FBA01E] to-[#D68619] text-white border-[#C87412] shadow-orange-500/20";
    case "risk":
      return "border-3 bg-linear-to-br from-[#E53935] via-[#B71C1C] to-[#8E1616] text-white border-[#7A1212] shadow-red-500/20";
    case "infosec pillars":
      return "border-3 bg-linear-to-br from-[#7E57C2] via-[#5E35B1] to-[#4527A0] text-white border-[#512DA8] shadow-purple-500/20";
    default:
      return "border-3 bg-gray-200 text-gray-700 border-gray-300";
  }
};

export default function CardContainer({
  isOpen,
  toggleOpen,
  preview = false,
  previewCards = [],
}) {
  const [cards, setCards] = useState([]);
  const [hiddenCards, setHiddenCards] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  // drag container
  const [position, setPosition] = useState(() => ({
    x:
      typeof window !== "undefined"
        ? Math.max(10, (window.innerWidth - 600) / 2)
        : 240,
    y:
      typeof window !== "undefined"
        ? Math.max(10, (window.innerHeight - 500) / 2)
        : 50,
  }));
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // touch card drag state
  const [touchDragging, setTouchDragging] = useState(false);
  const [draggedCardData, setDraggedCardData] = useState(null);

  // fetch cards
  useEffect(() => {
    if (!isOpen || preview) return;

    fetch(apiUrl("/card"))
      .then((r) => r.json())
      .then(setCards)
      .catch(console.error);
  }, [isOpen, preview]);

  // hide
  const hideCard = useCallback((id) => {
    setHiddenCards((prev) => [...prev, id]);
  }, []);

  useEffect(() => {
    const restoreHandler = (e) => {
      setHiddenCards((prev) => prev.filter((id) => id !== e.detail));
    };

    window.addEventListener("cardRestore", restoreHandler);
    return () => window.removeEventListener("cardRestore", restoreHandler);
  }, []);

  useEffect(() => {
    const handler = (e) => hideCard(e.detail);
    window.addEventListener("cardDrop", handler);
    return () => window.removeEventListener("cardDrop", handler);
  }, [hideCard]);

  // drag CONTAINER - MOUSE + TOUCH support
  useEffect(() => {
    if (touchDragging) return; // Don't move container while dragging a card

    const onMove = (e) => {
      if (!dragging) return;

      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;

      if (clientX !== undefined && clientY !== undefined) {
        setPosition({
          x: clientX - offset.x,
          y: clientY - offset.y,
        });
      }
    };

    const onUp = () => setDragging(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, offset, touchDragging]);

  // Start drag CONTAINER - handle both mouse and touch
  const handleDragStart = (e) => {
    // Prevent if touching a button, input, card, or interactive element
    if (
      e.target.closest("button") ||
      e.target.closest("input") ||
      e.target.closest('[draggable="true"]') ||
      e.target.closest("h3")
    ) {
      return;
    }

    setDragging(true);

    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;

    setOffset({
      x: clientX - position.x,
      y: clientY - position.y,
    });
  };

  // filtered cards
  const sourceCards = preview ? previewCards : cards;

  const visibleCards = sourceCards.filter(
    (c) =>
      !hiddenCards.includes(preview ? c.id : c.card_id) &&
      (activeCategory === "all" || c.category === activeCategory) &&
      (preview
        ? c.title.toLowerCase().includes(search.toLowerCase())
        : c.card_name.toLowerCase().includes(search.toLowerCase())),
  );

  // TOUCH CARD DRAG - make it work like desktop drag
  const handleCardTouchStart = (e, card) => {
    e.stopPropagation(); // Prevent container drag

    const touch = e.touches[0];
    const cardData = {
      id: preview ? card.id : card.card_id,
      title: preview ? card.title : card.card_name,
      category: card.category,
      description:
        card.description || CATEGORY_DESCRIPTIONS[card.category] || "",
    };

    setTouchDragging(true);
    setDraggedCardData(cardData);

    // Create visual feedback - a clone following the finger
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const clone = target.cloneNode(true);

    clone.style.position = "fixed";
    clone.style.pointerEvents = "none";
    clone.style.opacity = "0.7";
    clone.style.zIndex = "10000";
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.left = `${touch.clientX - rect.width / 2}px`;
    clone.style.top = `${touch.clientY - rect.height / 2}px`;
    clone.style.transform = "scale(1.05)";
    clone.id = "touch-drag-clone";
    document.body.appendChild(clone);

    const onTouchMove = (e) => {
      e.preventDefault(); // Prevent scrolling
      const touch = e.touches[0];
      const clone = document.getElementById("touch-drag-clone");
      if (clone) {
        clone.style.left = `${touch.clientX - rect.width / 2}px`;
        clone.style.top = `${touch.clientY - rect.height / 2}px`;
      }
    };

    const onTouchEnd = (e) => {
      const clone = document.getElementById("touch-drag-clone");
      if (clone) {
        clone.remove();
      }

      const touch = e.changedTouches[0];

      // Simulate a drop event that matches the desktop drag-and-drop API
      const dropTarget = document.elementFromPoint(
        touch.clientX,
        touch.clientY,
      );

      if (dropTarget) {
        // Create a synthetic drop event
        const dropEvent = new DragEvent("drop", {
          bubbles: true,
          cancelable: true,
          clientX: touch.clientX,
          clientY: touch.clientY,
        });

        // Add the dataTransfer-like object
        Object.defineProperty(dropEvent, "dataTransfer", {
          value: {
            getData: (type) => {
              if (type === "application/json") {
                return JSON.stringify(cardData);
              }
              return "";
            },
          },
          writable: false,
        });

        dropTarget.dispatchEvent(dropEvent);
      }

      setTouchDragging(false);
      setDraggedCardData(null);

      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };

    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed z-50 cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      style={{ left: position.x, top: position.y }}
    >
      <div
        className="bg-white rounded-xl shadow-xl flex flex-col pointer-events-auto
                  w-[calc(100vw-20px)] sm:w-[500px] md:w-[600px] lg:w-[800px] xl:w-[900px]
                  h-[calc(100vh-60px)] sm:h-[450px] md:h-[500px] lg:h-[550px] xl:h-[600px]
                  min-w-[280px] min-h-[300px]"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 md:px-8 pt-3 sm:pt-4 md:pt-6 pb-2 sm:pb-3 md:pb-4 relative select-none pointer-events-none">
          {/* Close button */}
          <button
            onClick={toggleOpen}
            className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 text-gray-400 hover:text-gray-600 z-10 pointer-events-auto"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>

          {/* Title, subtitle */}
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-0.5 sm:mb-1 text-left text-black/70">
            Your Cards
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm text-left">
            Drag from anywhere to move, search and add cards into the board.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-3 sm:px-6 pointer-events-auto overflow-x-auto">
          <div className="flex justify-center gap-0.5 sm:gap-1 flex-nowrap">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.key;

              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`pb-2 sm:pb-3 px-2 sm:px-3 text-xs sm:text-sm font-medium relative whitespace-nowrap ${
                    active
                      ? "text-gray-900 font-semibold"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {cat.label}
                  {active && (
                    <span
                      className={`absolute left-0 right-0 -bottom-[2px] h-[2px] rounded-full ${cat.color}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div className="px-3 sm:px-6 pt-2 sm:pt-4 pointer-events-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cards"
            className="w-full border border-gray-300 rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm
              focus:outline-none focus:ring-2 focus:ring-[#2EE58A] pointer-events-auto"
          />
        </div>

        {/* Cards */}
        <div className="p-4 sm:p-5 md:p-8 overflow-y-auto flex-1 pointer-events-auto">
          <div
            className="grid gap-4 sm:gap-5 md:gap-6 justify-start"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
            }}
          >
            {visibleCards.map((card) => (
              <CardItem
                key={preview ? card.id : card.card_id}
                card={card}
                preview={preview}
                onTouchStart={handleCardTouchStart}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
