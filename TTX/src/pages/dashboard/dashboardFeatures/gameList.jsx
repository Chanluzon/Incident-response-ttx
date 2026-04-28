import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import BG from "../../../images/auth-background.png";
import { apiUrl } from "../../../config/api";

export default function GameList({ showToast }) {
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [gameCode, setGameCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);


  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch(apiUrl("/games"));
        const data = await res.json();
        setGames(data);
      } catch (err) {
        console.error(err);
        showToast?.("Failed to load games", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [showToast]);

  const openJoinModal = () => {
    setGameCode("");
    setShowJoinModal(true);
  };

  const joinGame = async () => {
    const stored = JSON.parse(localStorage.getItem("currentGroup"));
    const group = stored?.group;

    if (!group) {
      showToast?.("You must be logged in as a group", "error");
      return;
    }

    if (!selectedGame?.game_id) {
      showToast?.("No game selected. Please try again.", "error");
      return;
    }

    if (!gameCode.trim()) {
      showToast?.("Please enter a game code", "warning");
      return;
    }

    try {
      setJoining(true);

      const res = await fetch(apiUrl("/game-group/join"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_id: selectedGame.game_id,
          game_code: gameCode.trim().toUpperCase(),
          group_id: group.group_id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast?.(data.error || data.message || "Failed to join game", "error");
        return;
      }

      // ✅ success only
      localStorage.setItem("joinedGame", JSON.stringify(data));
      showToast?.("Joined game successfully!", "success");
      setShowJoinModal(false);
      navigate("/TTXGame");

    } catch (err) {
      console.error(err);
      showToast?.("Server error while joining game", "error");
    } finally {
      setJoining(false);
    }
  };


  return (
    <div
      className="relative w-screen min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${BG})` }}
    >
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

      <div 
        className="relative z-10 min-h-screen p-4 sm:p-6 md:p-8 lg:p-10 bg-white/20 backdrop-blur-lg"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.45) 100%)",
        }}
      >
        {/* Back Button */}
        <button
          onClick={() => navigate("/Dashboard")}
          className="
            absolute top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6
            flex items-center gap-1 sm:gap-2
            px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full
            bg-white/70 backdrop-blur-xl
            text-slate-700 font-medium text-xs sm:text-sm md:text-base
            shadow-md
            hover:bg-white transition
            z-10
          "
        >
          <ArrowLeft size={14} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]" />
          <span className="hidden xs:inline sm:inline">Back</span>
        </button>

        {/* Preview Board Button */}
        <button
          onClick={() => navigate("/PreviewBoard")}
          className="
            absolute top-3 sm:top-4 md:top-6 right-3 sm:right-4 md:right-6
            px-2 sm:px-3 md:px-5 py-1 sm:py-1.5 md:py-2 rounded-full
            bg-white/70 backdrop-blur-xl
            text-slate-700 font-medium text-xs sm:text-sm md:text-base
            shadow-md
            hover:bg-white transition
            z-10
          "
        >
          <span className="hidden xs:inline sm:inline">Preview Board</span>
          <span className="xs:hidden sm:hidden">Preview</span>
        </button>

        {/* Header */}
        <div className="flex justify-center mt-8 sm:mt-10 md:mt-12 lg:mt-14 mb-6 sm:mb-8 md:mb-10 lg:mb-14">
          <h1 className="
            text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight
            text-slate-800
            bg-white/60 backdrop-blur-xl
            border border-white/40
            px-4 sm:px-5 md:px-6 lg:px-8 
            py-2 sm:py-3 md:py-3 lg:py-4 
            rounded-xl sm:rounded-2xl md:rounded-2xl lg:rounded-3xl
            shadow-[0_10px_30px_rgba(0,0,0,0.15)]
          ">
            Available Games
          </h1>
        </div>

        {/* Game list */}
        {loading ? (
          <p className="text-center text-slate-600 text-sm sm:text-base">Loading games…</p>
        ) : (
          <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 max-w-3xl mx-auto px-2 sm:px-4 md:px-0">
            {games.map((game) => (
              <div
                key={game.game_id}
                className="
                  bg-white/70 backdrop-blur-xl
                  rounded-xl sm:rounded-2xl md:rounded-3xl 
                  p-3 sm:p-4 md:p-5 lg:p-6
                  shadow-lg
                  flex flex-col sm:flex-row justify-between items-start sm:items-center
                  gap-3 sm:gap-4
                  hover:shadow-2xl transition
                "
              >
                <div className="w-full sm:w-auto">
                  <h2 className="text-left text-base sm:text-lg md:text-xl font-semibold text-slate-900">
                    {game.game_name}
                  </h2>
                  <p className="text-left text-xs sm:text-sm text-slate-700 capitalize">
                    {game.game_type}
                  </p>
                </div>

                <button
                  onClick={() => { 
                    setSelectedGame(game); 
                    openJoinModal(); 
                  }}
                  className="
                    w-full sm:w-auto
                    px-4 sm:px-5 md:px-6 
                    py-1.5 sm:py-2
                    rounded-full
                    bg-emerald-500 hover:bg-emerald-600
                    text-white font-semibold text-sm sm:text-base
                    shadow-md hover:shadow-lg
                    transition
                  "
                >
                  Join
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Join modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/95 p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-[320px] sm:max-w-[350px] md:max-w-[380px] relative">
            <button
              onClick={() => setShowJoinModal(false)}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>

            <h2 className="text-left text-xl sm:text-2xl font-bold text-slate-800 mb-1">
              Join Game
            </h2>
            <p className="text-left text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6">
              Enter the game code provided by the moderator
            </p>

            <input
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value)}
              placeholder="GAME CODE"
              className="
                w-full text-center
                border border-slate-300
                rounded-lg sm:rounded-xl 
                px-3 sm:px-4 
                py-2 sm:py-3 
                mb-4 sm:mb-6
                text-sm sm:text-base
                text-slate-700 tracking-widest
                focus:outline-none focus:ring-2 focus:ring-emerald-400
              "
            />

            <button
              onClick={joinGame}
              disabled={joining}
              className="
                w-full 
                py-2 sm:py-3
                rounded-full
                bg-emerald-500 hover:bg-emerald-600
                text-white font-semibold text-sm sm:text-base
                disabled:opacity-50
              "
            >
              {joining ? "Joining…" : "Join Game"}
            </button>
          </div>
        </div>
      )}
    </div>
  );}
