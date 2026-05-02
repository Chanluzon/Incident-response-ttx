import React from "react";
import { X, Trash2 } from "lucide-react";

const CATEGORY_DESCRIPTIONS = {
  prepare:
    "Protective measures (policies, procedures, or technologies) implemented to prevent, detect, or mitigate security risks and protect assets.",
  detect:
    "Weaknesses, flaws, or gaps in an information system, security procedures, internal controls, or implementation that could be exploited by a threat.",
  "respond":
    "Individuals, groups, or entities (internal or external) that have the potential to exploit a vulnerability and cause harm to an organization's assets.",
  recover: "The potential for loss, damage, or destruction of an asset as a result of a threat exploiting a vulnerability; often measured as Impact × Likelihood.",
  "lessons learned":
    "The core principles of information security, commonly known as the CIA Triad: Confidentiality, Integrity, and Availability.",
};

const INFOSEC_LIMIT = 1;

function MiniCardItem({ card, locked, onRemoveCard, onClick }) {
  const description =
    card.description || CATEGORY_DESCRIPTIONS[card.category] || "";

  return (
    <div
      className={`relative flex-shrink-0 cursor-pointer rounded-xl
        w-[140px] h-[160px] hover:scale-[1.02] transition-transform duration-300 ease-out shadow-md hover:shadow-lg border p-4 text-xs select-none ${getCardColor(card.category)}`}
      onClick={() => onClick(card)}
    >
      {card.image && (
        <div className="w-full h-[35px] mb-2 flex justify-center items-center overflow-hidden rounded">
          <img src={card.image} alt={card.card_name} className="max-w-full max-h-full object-contain" />
        </div>
      )}
      <h3 className="font-semibold text-sm text-center leading-tight line-clamp-1">
        {card.card_name}
      </h3>
      <p className="text-[10px] text-center mt-1 opacity-80 line-clamp-2 leading-tight">
        {description}
      </p>

      <button
        disabled={locked}
        onClick={(e) => {
          e.stopPropagation();
          onRemoveCard(card.card_id);
        }}
        className={`absolute bottom-2 right-2 p-2 rounded-full text-xs font-semibold
          ${
            locked
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-red-100 hover:bg-red-200 text-red-700"
          }`}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

const getCardColor = (cat) => {
  switch (cat) {
    case "prepare":
      return "bg-[#67C2C9] text-white border-white/20 shadow-cyan-500/20";
    case "detect":
      return "bg-[#FDEE00] text-yellow-900 border-white/20 shadow-yellow-500/20";
    case "respond":
      return "bg-[#FF9EBD] text-white border-white/20 shadow-pink-500/20";
    case "recover":
      return "bg-[#32CD32] text-white border-white/20 shadow-green-500/20";
    case "lessons learned":
      return "bg-[#FFB347] text-white border-white/20 shadow-orange-500/20";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
};


export default function ContainerModal({
  container,
  cards,
  answerCardIds,
  onClose,
  onRemoveCard,
  locked = false,
}) {
  const [selectedCard, setSelectedCard] = React.useState(null);

  const isInfosecContainer =
    container.category === "lessons learned";

  const isInfosecFull =
    isInfosecContainer && cards.length >= INFOSEC_LIMIT;

  const MAX_CARDS_PER_CONTAINER = 10;

  const cardsWithAnswerFlag = cards.map((card) => ({
    ...card,
    is_answer: answerCardIds?.has(Number(card.card_id)) ?? false,
  }));

  const answerCards = cardsWithAnswerFlag.filter((c) => c.is_answer);
  const nonAnswerCards = cardsWithAnswerFlag.filter((c) => !c.is_answer);

  const remainingSlots = MAX_CARDS_PER_CONTAINER - answerCards.length;

  const visibleCards =
    remainingSlots > 0
      ? [...answerCards, ...nonAnswerCards.slice(0, remainingSlots)]
      : answerCards.slice(0, MAX_CARDS_PER_CONTAINER);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
      onMouseDown={onClose}>
      <div className="bg-white/80 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-2xl w-full max-w-2xl h-[500px] p-6 sm:p-8 relative flex flex-col overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}>
        
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="relative z-10 mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none mb-2 uppercase">
            {container.title}
          </h2>
          <p className="text-slate-600 text-sm font-medium">
            Assigned Phase Cards
          </p>
        </div>

        {isInfosecFull && (
          <p className="text-sm text-purple-600 mb-3 text-left">
            Only one InfoSec Pillar card is allowed in this container.
          </p>
        )}

        {/* Cards */}
        {cards.length === 0 ? (
          <p className="text-gray-400 text-center mt-20">
            No cards in this container yet.
          </p>
        ) : (
          <div className="grid gap-4 overflow-y-auto pr-2 justify-start"
            style={{
              gridTemplateColumns: "repeat(4, 155px)",
            }}
          >

            {visibleCards.map((card) => (
              <MiniCardItem
                key={card.card_id}
                card={card}
                locked={locked}
                onRemoveCard={onRemoveCard}
                onClick={setSelectedCard}
              />
            ))}
          </div>
        )}
      </div>

      {selectedCard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[200] transition-opacity duration-200" onMouseDown={(e) => { e.stopPropagation(); setSelectedCard(null); }}>
          <div 
            className={`rounded-2xl shadow-2xl w-[320px] sm:w-[400px] min-h-[450px] p-6 sm:p-8 relative transform transition-all duration-300 scale-95 opacity-0 animate-[fadeIn_0.25s_ease-out_forwards] text-center flex flex-col justify-center items-center border-4 ${getCardColor(selectedCard.category)}`}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute top-4 right-4 text-black/50 hover:text-black"
            >
              <X size={24} />
            </button>
            
            {selectedCard.image && (
              <div className="w-[calc(100%+3rem)] sm:w-[calc(100%+4rem)] h-[80px] sm:h-[100px] -mt-6 sm:-mt-8 -mx-6 sm:-mx-8 mb-6 flex justify-center items-center overflow-hidden rounded-t-2xl bg-black/5">
                <img src={selectedCard.image} alt={selectedCard.card_name} className="max-w-full max-h-full object-contain" />
              </div>
            )}

            <div className="inline-block px-4 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 bg-white/30 border border-white/20">
              {selectedCard.category}
            </div>

            <h2 className="text-xl sm:text-2xl font-black mb-3 leading-tight drop-shadow-sm">
              {selectedCard.card_name}
            </h2>
            
            <div className="mt-auto w-full p-4 bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl">
              <p className="text-sm sm:text-base font-semibold italic leading-relaxed drop-shadow-sm">
                {selectedCard.description || CATEGORY_DESCRIPTIONS[selectedCard.category]}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
