import React from "react";
import { X, Trash2 } from "lucide-react";

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

const INFOSEC_LIMIT = 1;

function MiniCardItem({ card, locked, onRemoveCard }) {
  const [isFlipped, setIsFlipped] = React.useState(false);
  const description =
    card.description || CATEGORY_DESCRIPTIONS[card.category] || "";

  return (
    <div
      className={`card-flip-container ${isFlipped ? "is-flipped" : ""}
        w-[140px] h-[160px] hover:scale-[1.02] transition-transform duration-300 ease-out`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="card-flip-inner shadow-md hover:shadow-lg">
        {/* Front */}
        <div
          className={`card-flip-front border p-4 text-xs select-none ${getCardColor(
            card.category,
          )}`}
        >
          <h3 className="font-semibold text-sm text-center leading-tight">
            {card.card_name}
          </h3>

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

        {/* Back */}
        <div
          className={`card-flip-back border p-2 text-[10px] leading-tight select-none ${getCardColor(
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
      return "bg-linear-to-br from-[#FFEC5C] via-[#FFDE21] to-[#E5C71E] text-white border-white/20 shadow-yellow-500/20";
    case "vulnerability":
      return "bg-linear-to-br from-[#3A7BD5] via-[#295794] to-[#1B3B66] text-white border-white/20 shadow-blue-500/20";
    case "threat agents":
      return "bg-linear-to-br from-[#FFB84D] via-[#FBA01E] to-[#D68619] text-white border-white/20 shadow-orange-500/20";
    case "risk":
      return "bg-linear-to-br from-[#E53935] via-[#B71C1C] to-[#8E1616] text-white border-white/20 shadow-red-500/20";
    case "infosec pillars":
      return "bg-linear-to-br from-[#7E57C2] via-[#5E35B1] to-[#4527A0] text-white border-white/20 shadow-purple-500/20";
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

  const isInfosecContainer =
    container.category === "infosec pillars";

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
    <div className="fixed inset-0 bg-gray/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onMouseDown={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-[700px] h-[500px] p-6 relative flex flex-col"
        onMouseDown={(e) => e.stopPropagation()}>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold mb-1 text-left">{container.title}</h2>
        <p className="text-gray-500 text-sm mb-6 text-left">
          Cards assigned to this container
        </p>

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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
