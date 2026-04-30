import React, { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import { apiUrl } from "../config/api";

// category config
const CATEGORIES = [
  { key: "all", label: "All", style: "bg-[#5C8AD1] text-white border-[#4A71B0]" },
  { key: "safeguard", label: "Prepare", style: "bg-[#67C2C9] text-slate-900 border-[#4DA8AF]" },
  { key: "vulnerability", label: "Detect", style: "bg-[#FDEE00] text-yellow-900 border-[#D4C800]" },
  { key: "threat agents", label: "Respond", style: "bg-[#FF9EBD] text-pink-900 border-[#E87EA1]" },
  { key: "risk", label: "Recover", style: "bg-[#32CD32] text-green-900 border-[#28A428]" },
  { key: "infosec pillars", label: "Lessons Learned", style: "bg-[#FFB347] text-orange-900 border-[#E6952D]" },
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

function CardItem({ card, preview, onTouchStart, onDragStartCallback }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const id = preview ? card.id : card.card_id;
  const title = preview ? card.title : card.card_name;
  const description =
    card.description || CATEGORY_DESCRIPTIONS[card.category] || "";

  return (
    <div
      className={`card-flip-container flex-shrink-0 ${isFlipped ? "is-flipped" : ""}
        w-[140px] sm:w-[150px] md:w-[160px]
        h-[190px] sm:h-[210px] md:h-[230px]
        hover:-translate-y-4 transition-transform duration-300 ease-out`}
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
              
              // Close the drawer immediately after the drag begins
              if (onDragStartCallback) {
                setTimeout(() => {
                  onDragStartCallback();
                }, 10); // Small delay ensures the browser registers the drag before unmounting
              }
            }}

          onTouchStart={(e) => !isFlipped && onTouchStart(e, card)}
          className={`card-flip-front border p-3 sm:p-4 text-xs sm:text-sm select-none ${getCardColor(
            card.category,
          )}`}
        >
          <h3 className="font-bold text-sm sm:text-base leading-snug text-center mt-2">
            {title}
          </h3>

        </div>

        {/* Back */}
        <div
          className={`card-flip-back border text-[10px] leading-tight select-none ${getCardColor(
            card.category,
          )}`}
        >
          <p className="italic font-medium text-xs sm:text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
}

const getCardColor = (cat) => {
  switch (cat) {
    case "safeguard":
      return "border-2 bg-[#67C2C9]/80 backdrop-blur-sm text-slate-900 border-[#4DA8AF]/50 shadow-lg shadow-cyan-500/20";
    case "vulnerability":
      return "border-2 bg-[#FDEE00]/80 backdrop-blur-sm text-yellow-900 border-[#D4C800]/50 shadow-lg shadow-yellow-500/20";
    case "threat agents":
      return "border-2 bg-[#FF9EBD]/80 backdrop-blur-sm text-pink-900 border-[#E87EA1]/50 shadow-lg shadow-pink-500/20";
    case "risk":
      return "border-2 bg-[#32CD32]/80 backdrop-blur-sm text-green-900 border-[#28A428]/50 shadow-lg shadow-green-500/20";
    case "infosec pillars":
      return "border-2 bg-[#FFB347]/80 backdrop-blur-sm text-orange-900 border-[#E6952D]/50 shadow-lg shadow-orange-500/20";
    default:
      return "border-2 bg-gray-200/80 backdrop-blur-sm text-gray-700 border-gray-300/50";
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

  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    } else if (isRendered) {
      const timer = setTimeout(() => setIsRendered(false), 280);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isRendered]);

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

  if (!isRendered) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/40 backdrop-blur-sm select-none transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      onMouseDown={toggleOpen}
    >
      <div
        className="bg-white/85 backdrop-blur-2xl border-t border-x border-white/40 rounded-t-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.3)] flex flex-col pointer-events-auto
                  w-full max-w-4xl
                  h-[450px] md:h-[500px]"
        onMouseDown={(e) => e.stopPropagation()}
        style={{ animation: isOpen ? "slideUp 0.3s ease-out forwards" : "slideDown 0.3s ease-in forwards" }}
      >



        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="px-6 sm:px-10 pt-4 sm:pt-6 pb-2 relative select-none pointer-events-none">
          {/* Close button */}
          <button
            onClick={toggleOpen}
            className="absolute top-4 sm:top-6 right-6 sm:right-10 text-slate-500 hover:text-slate-800 z-10 pointer-events-auto bg-white/50 hover:bg-white rounded-full p-2 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Title, subtitle */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-1 text-left text-slate-900 tracking-tight">
            Your Cards
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm text-left font-medium">
            Drag from anywhere to move, search and add cards into the board.
          </p>
        </div>



        {/* Tabs */}
        <div className="px-3 sm:px-6 pointer-events-auto overflow-x-auto mt-2">
          <div className="flex justify-start sm:justify-center gap-2 pb-2 flex-nowrap">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-4 py-2 rounded-md font-semibold text-xs sm:text-sm whitespace-nowrap border-2 shadow-sm transition-all
                    ${cat.style}
                    ${active ? "scale-105 shadow-md ring-2 ring-offset-1 ring-blue-400 opacity-100" : "opacity-70 hover:opacity-100"}
                  `}
                >
                  {cat.label}
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
            placeholder="Search cards..."
            className="w-full bg-white/90 text-slate-900 placeholder-slate-500 border border-white/60 shadow-inner rounded-xl px-4 py-2.5 text-sm font-medium
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all pointer-events-auto"
          />
        </div>

        {/* Cards Slider */}
        <div className="px-4 sm:px-6 py-4 overflow-x-auto overflow-y-hidden flex-1 pointer-events-auto hide-scrollbar scroll-smooth">
          <div className="flex gap-4 sm:gap-6 pt-6 pb-8 w-max min-w-full items-start justify-start px-2">
            {visibleCards.map((card) => (

              <CardItem
                key={preview ? card.id : card.card_id}
                card={card}
                preview={preview}
                onTouchStart={handleCardTouchStart}
                onDragStartCallback={toggleOpen}
              />

            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
