import React, { useState } from "react";
import { X } from "lucide-react";
import { apiUrl } from "../../../config/api";

export default function CreateGameModal({ show, onClose, showToast, logActivity, refreshDashboard }) {
  const [gameName, setGameName] = useState("");
    const [gameType, setGameType] = useState("");
    const [budget, setBudget] = useState("");
    const [reuseLimit, setReuseLimit] = useState("");

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-200">
      <div className="
        bg-white rounded-2xl shadow-2xl 
        w-[420px] p-6 relative 
        transform transition-all duration-300 scale-95 opacity-0 
        animate-[fadeIn_0.25s_ease-out_forwards] text-left"
      >
        <button
            onClick={() => {
                setGameName("");
                setGameType("");
                setBudget("");
                setReuseLimit("");
                onClose();
            }}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-2">Create New Game</h2>
        <p className="text-gray-500 text-sm mb-4">
          Set the game name and type
        </p>

        {/* Game Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Game Name
          </label>
          <input
            type="text"
            placeholder="Enter game name"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 
            focus:outline-none focus:ring-2 focus:ring-[#2EE58A]"
          />
        </div>

        {/* Game Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Game Type
          </label>
          <select
            value={gameType}
            onChange={(e) => setGameType(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 
            focus:outline-none focus:ring-2 focus:ring-[#2EE58A]"
          >
            <option value="">--Select Type--</option>
            <option value="simple">Simple</option>
            <option value="regular">Regular</option>
          </select>
        </div>

        {gameType === "regular" && (
            <div className="mt-4">
                {/* Budget */}
                <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget
                </label>
                <input
                    type="number"
                    placeholder="Enter budget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 
                    focus:outline-none focus:ring-2 focus:ring-[#2EE58A]"
                />
                </div>

                {/* Card Reuse Limit */}
                <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Reuse Limit
                </label>
                <input
                    type="number"
                    placeholder="How many times can a card be reused?"
                    value={reuseLimit}
                    onChange={(e) => setReuseLimit(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 
                    focus:outline-none focus:ring-2 focus:ring-[#2EE58A]"
                />
                </div>
            </div>
            )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={async () => {
                if (!gameName || !gameType) {
                    showToast("Please fill in all fields", "error");
                    return;
                }

                try {
                    const res = await fetch(apiUrl("/games"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        game_name: gameName,
                        game_type: gameType,
                    }),
                    });

                    if (!res.ok) throw new Error("Failed to create game");

                    const newGame = await res.json();

                    // settings if game is regular
                    if (gameType === "regular") {
                    const settingsRes = await fetch(apiUrl("/game-settings"), {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                        game_id: newGame.game_id,
                        budget,
                        card_reuse_limit: reuseLimit,
                        }),
                    });

                    if (!settingsRes.ok) throw new Error("Failed to save game settings");
                    }

                    showToast("Game created successfully!", "success");
                    refreshDashboard();
                    logActivity(`Created game "${gameName}"`, "success");

                    setGameName("");
                    setGameType("");
                    setBudget("");
                    setReuseLimit("");

                    setTimeout(() => {
                    onClose();
                    }, 700);

                } catch (err) {
                    console.error(err);
                    showToast("Failed to create game.", "error");
                }
                }}

            className="px-4 py-2 rounded-full bg-[#2EE58A] hover:bg-[#23c877] text-white font-semibold"
          >
            Create Game
          </button>
        </div>
      </div>
    </div>
  );
}
