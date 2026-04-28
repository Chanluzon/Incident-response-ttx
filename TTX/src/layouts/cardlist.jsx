import React from "react";
import { cardContents } from "../layouts/cardcontainers";

export default function CardList() {
  function drag(ev, card) {
    ev.dataTransfer.setData("application/json", JSON.stringify(card));
  }

  return (
    <div>
      {/* Draggable Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cardContents.map((card) => (
          <div
            key={card.id}
            draggable
            onDragStart={(e) => drag(e, card)}
            className={`p-4 border border-gray-300 rounded-lg 
              bg-gradient-to-b ${card.color} to-white 
              shadow-sm cursor-grab hover:shadow-md transition-all`}
          >
            <h4 className="font-semibold">{card.title}</h4>
            <p className="text-sm text-gray-600">{card.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
