import React, { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import { apiUrl } from "../config/api";
import { useTheme } from "../context/ThemeContext";

// category config
const CATEGORIES = [
  { key: "all", label: "All", style: "bg-[#5C8AD1] text-white border-[#4A71B0]" },
  { key: "prepare", label: "Prepare", style: "bg-[#67C2C9] text-slate-900 border-[#4DA8AF]" },
  { key: "detect", label: "Detect", style: "bg-[#FDEE00] text-yellow-900 border-[#D4C800]" },
  { key: "respond", label: "Respond", style: "bg-[#FF9EBD] text-pink-900 border-[#E87EA1]" },
  { key: "recover", label: "Recover", style: "bg-[#32CD32] text-green-900 border-[#28A428]" },
  { key: "lessons learned", label: "Lessons Learned", style: "bg-[#FFB347] text-orange-900 border-[#E6952D]" },
];





function CardItem({ card, preview, onTouchStart, onDragStartCallback, onClick }) {
  const id = preview ? card.id : card.card_id;
  const title = preview ? card.title : card.card_name;
  const description = card.description || "";

  return (
    <div
      className={`flex-shrink-0 cursor-pointer rounded-2xl
        w-[130px] sm:w-[140px] md:w-[150px]
        h-[180px] sm:h-[200px] md:h-[220px]
        hover:-translate-y-6 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-lg hover:shadow-2xl border p-4 sm:p-5 text-xs sm:text-sm select-none ${getCardColor(card.category)}`}
      onClick={() => onClick(card)}
      draggable={true}
      onDragStart={(e) => {
        e.dataTransfer.setData(
          "application/json",
          JSON.stringify({
            id,
            title,
            category: card.category,
            description: description,
            image: card.image,
          }),
        );
        if (onDragStartCallback) {
          setTimeout(() => {
            onDragStartCallback();
          }, 10);
        }
      }}
      onTouchStart={(e) => onTouchStart(e, card)}
    >
      {card.image && (
        <div className="w-full h-[40px] sm:h-[55px] -mt-3 mb-2 mx-auto flex justify-center items-center overflow-hidden">
          <img src={card.image} alt={title} className="max-w-full max-h-full object-contain filter drop-shadow-md" />
        </div>
      )}
      <div className="px-2 py-0.5 rounded-lg bg-black/10 border border-black/5 text-[9px] font-black uppercase tracking-widest opacity-60 mb-2 mx-auto w-fit">
        {card.category}
      </div>

      <p className="text-[11px] sm:text-[12px] text-center mt-1 opacity-90 line-clamp-3 leading-tight font-bold tracking-tight">
        {description}
      </p>
    </div>
  );
}

const getCardColor = (cat) => {
  switch (cat) {
    case "prepare":
      return "border-2 bg-[#67C2C9]/80 backdrop-blur-sm text-slate-900 border-[#4DA8AF]/50 shadow-lg shadow-cyan-500/20";
    case "detect":
      return "border-2 bg-[#FDEE00]/80 backdrop-blur-sm text-yellow-900 border-[#D4C800]/50 shadow-lg shadow-yellow-500/20";
    case "respond":
      return "border-2 bg-[#FF9EBD]/80 backdrop-blur-sm text-pink-900 border-[#E87EA1]/50 shadow-lg shadow-pink-500/20";
    case "recover":
      return "border-2 bg-[#32CD32]/80 backdrop-blur-sm text-green-900 border-[#28A428]/50 shadow-lg shadow-green-500/20";
    case "lessons learned":
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
  const { isLightMode } = useTheme();
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [usedCards, setUsedCards] = useState([]);
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

  // fetch cards and used cards
  useEffect(() => {
    if (!isOpen || preview) return;

    // Fetch all cards
    fetch(apiUrl("/card"))
      .then((r) => r.json())
      .then(setCards)
      .catch(console.error);

    // Fetch used cards
    const joinedGame = JSON.parse(localStorage.getItem("joinedGame"));
    const storedGroup = JSON.parse(localStorage.getItem("currentGroup"));

    if (joinedGame && storedGroup) {
      fetch(apiUrl(`/games/${joinedGame.game_id}/groups/${storedGroup.group.group_id}/used-cards`))
        .then((r) => r.json())
        .then((data) => setUsedCards(data || []))
        .catch(console.error);
    }
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
      !usedCards.includes(preview ? c.id : c.card_id) &&
      (activeCategory === "all" || c.category === activeCategory) &&
      (preview
        ? c.title.toLowerCase().includes(search.toLowerCase())
        : c.card_name.toLowerCase().includes(search.toLowerCase())),
  );

  // TOUCH CARD DRAG - make it work like desktop drag
  const handleCardTouchStart = (e, card) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    let dragStarted = false;

    const cardData = {
      id: preview ? card.id : card.card_id,
      title: preview ? card.title : card.card_name,
      category: card.category,
      description: card.description || "",
      image: card.image,
    };

    const onTouchMove = (moveEvent) => {
      const moveTouch = moveEvent.touches[0];
      const deltaX = Math.abs(moveTouch.clientX - startX);
      const deltaY = Math.abs(moveTouch.clientY - startY);

      if (!dragStarted && (deltaX > 15 || deltaY > 15)) {
        dragStarted = true;
        setTouchDragging(true);
        setDraggedCardData(cardData);
        
        // Visual feedback
        const clone = target.cloneNode(true);
        clone.style.position = "fixed";
        clone.style.pointerEvents = "none";
        clone.style.opacity = "0.8";
        clone.style.zIndex = "10000";
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
        clone.style.left = `${moveTouch.clientX - rect.width / 2}px`;
        clone.style.top = `${moveTouch.clientY - rect.height / 2}px`;
        clone.style.transform = "scale(1.1)";
        clone.id = "touch-drag-clone";
        document.body.appendChild(clone);

        // Close drawer so we can see the board, just like on desktop
        if (toggleOpen) toggleOpen();
      }

      if (dragStarted) {
        moveEvent.preventDefault();
        const clone = document.getElementById("touch-drag-clone");
        if (clone) {
          clone.style.left = `${moveTouch.clientX - rect.width / 2}px`;
          clone.style.top = `${moveTouch.clientY - rect.height / 2}px`;
        }
      }
    };

    const onTouchEnd = (endEvent) => {
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);

      if (!dragStarted) return;

      const clone = document.getElementById("touch-drag-clone");
      if (clone) clone.remove();

      const endTouch = endEvent.changedTouches[0];
      
      // Hide the clone temporarily to get the element underneath if needed
      // (Though we already removed it)
      
      const dropTarget = document.elementFromPoint(endTouch.clientX, endTouch.clientY);
      const container = dropTarget?.closest(".drop-target");

      if (container) {
        // Dispatch synthetic drop event
        const dropEvent = new DragEvent("drop", {
          bubbles: true,
          cancelable: true,
          clientX: endTouch.clientX,
          clientY: endTouch.clientY,
        });

        Object.defineProperty(dropEvent, "dataTransfer", {
          value: {
            getData: (type) => {
              if (type === "application/json") return JSON.stringify(cardData);
              return "";
            },
          },
        });

        container.dispatchEvent(dropEvent);
      }

      setTouchDragging(false);
      setDraggedCardData(null);
    };

    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);
  };

  if (!isRendered) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-end justify-center backdrop-blur-sm select-none transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} ${isLightMode ? 'bg-slate-900/10' : 'bg-slate-900/40'}`}
      onMouseDown={toggleOpen}
    >
      <div
        className={`backdrop-blur-3xl border-t border-x rounded-t-[2.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.4)] flex flex-col pointer-events-auto transition-all duration-700
                  w-full max-w-2xl
                  h-[440px] md:h-[500px]
                  ${isLightMode 
                    ? 'bg-white/90 border-white/50' 
                    : 'bg-[#0f172a]/95 border-blue-500/20'}`}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ 
          animation: isOpen ? "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" : "slideDown 0.4s cubic-bezier(0.7, 0, 0.84, 0) forwards"
        }}
      >



        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="px-6 sm:px-10 pt-3 sm:pt-4 pb-1 relative select-none pointer-events-none">
          {/* Close button */}
          <button
            onClick={toggleOpen}
            className={`absolute top-3 sm:top-4 right-6 sm:right-10 z-10 pointer-events-auto rounded-full p-2 transition-all duration-300
                      ${isLightMode ? 'text-slate-500 hover:text-slate-800 bg-slate-100/50 hover:bg-slate-200' : 'text-white/60 hover:text-white bg-white/5 hover:bg-white/10'}`}
          >
            <X size={20} />
          </button>

          {/* Title, subtitle */}
          <h2 className={`text-xl sm:text-2xl md:text-3xl font-black mb-1 text-left tracking-tight transition-colors duration-1000 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
            Your Cards
          </h2>
          <p className={`text-xs sm:text-sm text-left font-medium transition-colors duration-1000 ${isLightMode ? 'text-slate-600' : 'text-white/60'}`}>
            Drag from anywhere to move, search and add cards into the board.
          </p>
        </div>



        {/* Tabs */}
        <div className="px-3 sm:px-6 pointer-events-auto overflow-x-auto mt-1 py-2">
          <div className="flex justify-start sm:justify-center gap-2 pb-1 flex-nowrap">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap border-2 transition-all duration-300 ${cat.style}
                    ${active 
                      ? `scale-105 shadow-[0_0_15px_rgba(0,0,0,0.1)] ring-2 ring-offset-2 ${isLightMode ? 'ring-blue-400 ring-offset-white' : 'ring-blue-500 ring-offset-[#0f172a]'} opacity-100` 
                      : `opacity-50 hover:opacity-80`
                    }
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
            className={`w-full shadow-inner rounded-xl px-4 py-2.5 text-sm font-medium
              focus:outline-none focus:ring-2 transition-all pointer-events-auto duration-1000
              ${isLightMode 
                ? 'bg-white/90 text-slate-900 placeholder-slate-400 border border-slate-200 focus:ring-blue-400 focus:bg-white' 
                : 'bg-white/5 text-white placeholder-white/30 border border-white/10 focus:ring-blue-500/50 focus:bg-white/10'}`}
          />
        </div>

        {/* Cards Slider */}
        <div className="px-4 sm:px-6 py-1 overflow-x-auto overflow-y-visible flex-1 pointer-events-auto hide-scrollbar scroll-smooth">
          <div className="flex gap-4 sm:gap-6 pt-10 pb-6 w-max min-w-full items-start justify-start px-2">
            {visibleCards.map((card) => (

              <CardItem
                key={preview ? card.id : card.card_id}
                card={card}
                preview={preview}
                onTouchStart={handleCardTouchStart}
                onDragStartCallback={toggleOpen}
                onClick={setSelectedCard}
              />

            ))}
          </div>
        </div>

      </div>

      {selectedCard && (
        <div
          className={`fixed inset-0 backdrop-blur-md flex items-center justify-center z-[200] transition-all duration-300 ${isLightMode ? 'bg-slate-900/20' : 'bg-slate-950/60'}`}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedCard(null);
          }}
        >
          <div
            className={`rounded-2xl shadow-2xl w-[320px] sm:w-[400px] min-h-[450px] p-6 sm:p-8 relative transform transition-all duration-300 scale-95 opacity-0 animate-[fadeIn_0.25s_ease-out_forwards] text-center flex flex-col justify-center items-center border-4 ${getCardColor(selectedCard.category)}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute top-4 right-4 text-black/50 hover:text-black"
            >
              <X size={24} />
            </button>

            {selectedCard.image && (
              <div className="w-[calc(100%+3rem)] sm:w-[calc(100%+4rem)] h-[80px] sm:h-[100px] -mt-6 sm:-mt-8 -mx-6 sm:-mx-8 mb-6 flex justify-center items-center overflow-hidden rounded-t-2xl">
                <img src={selectedCard.image} alt={preview ? selectedCard.title : selectedCard.card_name} className="max-w-full max-h-full object-contain" />
              </div>
            )}

            <div className="inline-block px-4 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 bg-white/30 border border-black/10">
              {selectedCard.category}
            </div>



            <div className="mt-auto w-full p-4 bg-white/20 backdrop-blur-sm border border-black/10 rounded-xl">
              <p className="text-sm sm:text-base font-semibold italic leading-relaxed drop-shadow-sm">
                {selectedCard.description || ""}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
