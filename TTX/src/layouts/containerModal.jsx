import React from "react";
import { X, Trash2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import FormattedDescription from "../components/FormattedDescription";



const INFOSEC_LIMIT = 1;

function MiniCardItem({ card, locked, onRemoveCard, onClick }) {
  const description = card.description || "";

  return (
    <div
      className={`flex flex-col flex-shrink-0 cursor-pointer rounded-2xl
        w-[130px] h-[200px] hover:-translate-y-2 transition-all duration-300 ease-out shadow-lg hover:shadow-xl border p-4 text-xs select-none overflow-hidden ${getCardColor(card.category)}`}
      onClick={() => onClick(card)}
    >
      {card.image && (
        <div className="w-[calc(100%+2rem)] h-[40px] -mt-6 -mx-4 mb-0 flex justify-center items-end overflow-hidden rounded-t-xl">
          <img src={card.image} alt={card.card_name} className="max-w-full max-h-full object-contain filter drop-shadow-md" />
        </div>
      )}
      <div className="px-2 py-0.5 rounded-lg bg-black/10 border border-black/5 text-[8px] font-black uppercase tracking-widest opacity-60 mb-1 mx-auto w-fit mt-1">
        {card.category}
      </div>

      {/* Shadow Box Description */}
      <div className="flex-1 flex flex-col mb-[-1rem] mx-[-0.85rem] min-h-0">
        <div className={`flex-1 p-2.5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.25)] border backdrop-blur-[8px] overflow-hidden flex flex-col ${getCardInnerStyle(card.category)}`}>
          <div className="opacity-95 line-clamp-6 leading-tight font-bold tracking-tight text-[10px]">
            <FormattedDescription description={description} isCard={true} />
          </div>
        </div>
      </div>

      {/* Remove button */}
      {!locked && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemoveCard(card.card_id);
          }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-red-100/80 hover:bg-red-200 text-red-700 z-10"
        >
          <Trash2 size={12} />
        </button>
      )}
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

const getCardInnerStyle = (cat) => {
  switch (cat) {
    case "prepare":
      return "bg-white/20 border-white/30 text-slate-900";
    case "detect":
      return "bg-black/5 border-black/10 text-yellow-950";
    case "respond":
      return "bg-white/20 border-white/30 text-pink-950";
    case "recover":
      return "bg-white/20 border-white/30 text-green-950";
    case "lessons learned":
      return "bg-white/20 border-white/30 text-orange-950";
    default:
      return "bg-black/5 border-black/10 text-gray-800";
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
  const { isLightMode } = useTheme();
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
    <div className={`fixed inset-0 backdrop-blur-md z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isLightMode ? 'bg-slate-900/20' : 'bg-slate-950/60'}`}
      onMouseDown={onClose}>
      <div className={`backdrop-blur-3xl border rounded-[2.5rem] shadow-2xl w-full max-w-xl h-[500px] p-6 sm:p-8 relative flex flex-col overflow-hidden transition-all duration-500
        ${isLightMode ? 'bg-white/90 border-white/50' : 'bg-[#0f172a]/95 border-blue-500/20'}`}
        onMouseDown={(e) => e.stopPropagation()}>

        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300
            ${isLightMode ? 'text-slate-400 hover:text-slate-600 bg-slate-100/50 hover:bg-slate-100' : 'text-white/40 hover:text-white bg-white/5 hover:bg-white/10'}`}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="relative z-10 mb-6">
          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight leading-none mb-2 uppercase transition-colors duration-1000 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
            {container.title}
          </h2>
          <p className={`text-sm font-medium transition-colors duration-1000 ${isLightMode ? 'text-slate-600' : 'text-white/60'}`}>
            Assigned Phase Cards
          </p>
        </div>




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
        <div className={`fixed inset-0 backdrop-blur-md flex items-center justify-center z-[200] transition-all duration-300 ${isLightMode ? 'bg-slate-900/20' : 'bg-slate-950/60'}`} onMouseDown={(e) => { e.stopPropagation(); setSelectedCard(null); }}>
          <div
            className={`relative w-full max-w-md h-[600px] flex flex-col overflow-hidden rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 border transition-colors duration-1000 ${getCardColor(selectedCard.category)}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute top-4 right-4 text-black/50 hover:text-black"
            >
              <X size={24} />
            </button>

            {selectedCard.image && (
              <div className="w-[calc(100%+3rem)] sm:w-[calc(100%+4rem)] h-[80px] sm:h-[100px] -mt-6 sm:-mt-8 -mx-6 sm:-mx-8 mb-1 flex justify-center items-center overflow-hidden rounded-t-2xl">
                <img src={selectedCard.image} alt={selectedCard.card_name} className="max-w-full max-h-full object-contain" />
              </div>
            )}

            <div className="inline-block px-5 py-2 rounded-full text-sm sm:text-base font-black uppercase tracking-[0.25em] mb-4 bg-white/30 border border-white/20 shadow-md">
              {selectedCard.category}
            </div>



            {/* Shadow Box Description */}
            <div className="flex-1 flex flex-col mb-[-2rem] mx-[-2rem] min-h-0">
              <div className={`flex-1 p-6 rounded-t-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border backdrop-blur-[10px] flex flex-col min-h-0 ${getCardInnerStyle(selectedCard.category)}`}>
                <div className="flex-1 overflow-y-auto min-h-0 pr-2 custom-scrollbar">
                  <FormattedDescription 
                    description={selectedCard.description} 
                    className="text-base sm:text-lg font-semibold italic leading-relaxed drop-shadow-sm" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
