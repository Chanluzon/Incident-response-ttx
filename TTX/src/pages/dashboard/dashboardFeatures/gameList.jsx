import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { apiUrl } from "../../../config/api";
import { useTheme } from "../../../context/ThemeContext";

export default function GameList({ showToast }) {
  const navigate = useNavigate();
  const { isLightMode } = useTheme();

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
    <div className={`relative w-screen min-h-screen overflow-hidden transition-colors duration-1000 ${isLightMode ? 'bg-slate-50' : 'bg-slate-950'}`}>
      {/* Background to match startgame */}
      <div className={`absolute inset-0 z-0 transition-all duration-1000 bg-gradient-to-br ${isLightMode ? 'from-slate-100 via-blue-50 to-slate-200' : 'from-slate-900 via-blue-900 to-indigo-950'}`} />
      
      {/* Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden z-0 opacity-40 pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-float transition-colors duration-1000 ${isLightMode ? 'bg-blue-300/40' : 'bg-blue-600/30'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] animate-morph transition-colors duration-1000 ${isLightMode ? 'bg-indigo-300/30' : 'bg-indigo-600/20'}`} />
        <div className={`absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full blur-[100px] animate-float [animation-delay:2s] transition-colors duration-1000 ${isLightMode ? 'bg-cyan-300/20' : 'bg-cyan-600/20'}`} />
      </div>

      <div 
        className={`relative z-10 min-h-screen p-4 sm:p-6 md:p-8 lg:p-10 backdrop-blur-md transition-colors duration-1000 ${isLightMode ? 'bg-white/30 text-slate-800' : 'bg-white/10 text-white'}`}
      >
        {/* Back Button */}
        <button
          onClick={() => navigate("/Dashboard")}
          className={`absolute top-4 sm:top-6 lg:top-8 left-4 sm:left-6 lg:left-8
            flex items-center gap-2
            px-4 lg:px-5 py-2 lg:py-2.5 rounded-full
            backdrop-blur-xl border transition-all duration-300 group z-10 shadow-lg
            font-medium text-sm md:text-base hover:-translate-x-1
            ${isLightMode 
              ? 'bg-white/50 hover:bg-white/80 border-slate-300 text-slate-600 hover:text-slate-900 shadow-[0_0_20px_rgba(0,0,0,0.05)]' 
              : 'bg-white/5 hover:bg-white/15 border-white/10 hover:border-white/30 text-white/80 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]'
            }`}
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="hidden sm:inline tracking-wide">Back</span>
        </button>

        {/* Preview Board Button */}
        <button
          onClick={() => navigate("/PreviewBoard")}
          className={`absolute top-4 sm:top-6 lg:top-8 right-4 sm:right-6 lg:right-8
            px-4 lg:px-5 py-2 lg:py-2.5 rounded-full
            backdrop-blur-xl border transition-all duration-300 z-10 shadow-lg
            font-medium text-sm md:text-base
            ${isLightMode 
              ? 'bg-white/50 hover:bg-white/80 border-slate-300 text-slate-600 hover:text-slate-900 shadow-[0_0_20px_rgba(0,0,0,0.05)]' 
              : 'bg-white/5 hover:bg-white/15 border-white/10 hover:border-white/30 text-white/80 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]'
            }`}
        >
          <span className="hidden sm:inline tracking-wide">Preview Board</span>
          <span className="sm:hidden tracking-wide">Preview</span>
        </button>

        {/* Header */}
        <div className="flex justify-center mt-16 sm:mt-20 md:mt-12 lg:mt-14 mb-8 sm:mb-12">
          <h1 className={`
            text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight
            text-transparent bg-clip-text bg-gradient-to-br
            px-6 py-4 transition-colors duration-1000
            ${isLightMode ? 'from-slate-800 to-slate-500 drop-shadow-sm' : 'from-white to-white/70 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]'}
          `}>
            Available Games
          </h1>
        </div>

        {/* Game list */}
        {loading ? (
          <p className={`text-center text-sm sm:text-base font-medium transition-colors duration-1000 ${isLightMode ? 'text-slate-500' : 'text-white/60'}`}>Loading games…</p>
        ) : (
          <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto px-2 sm:px-4 md:px-0 relative z-20">
            {games.map((game) => (
              <div
                key={game.game_id}
                className={`
                  backdrop-blur-2xl border
                  rounded-2xl sm:rounded-3xl 
                  p-5 sm:p-6 lg:p-8
                  shadow-xl
                  flex flex-col sm:flex-row justify-between items-start sm:items-center
                  gap-4 sm:gap-6
                  hover:-translate-y-1 hover:shadow-2xl transition-all duration-300
                  ${isLightMode ? 'bg-white/60 hover:bg-white/80 border-slate-300' : 'bg-white/5 hover:bg-white/10 border-white/10'}
                `}
              >
                <div className="w-full sm:w-auto">
                  <h2 className={`text-left text-lg sm:text-xl lg:text-2xl font-bold mb-1 transition-colors duration-1000 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                    {game.game_name}
                  </h2>
                  <p className={`text-left text-xs sm:text-sm capitalize tracking-wider font-medium transition-colors duration-1000 ${isLightMode ? 'text-slate-500' : 'text-white/50'}`}>
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
                    px-6 lg:px-8 
                    py-2.5 sm:py-3
                    rounded-full
                    bg-emerald-500 hover:bg-emerald-400
                    text-white font-bold text-sm sm:text-base
                    shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95
                    transition-all duration-300
                  "
                >
                  Join Game
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Join modal */}
      {showJoinModal && (
        <div className={`fixed inset-0 z-[1000] backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300 ${isLightMode ? 'bg-slate-100/60' : 'bg-slate-950/80'}`}>
          <div className={`backdrop-blur-2xl border p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-[320px] sm:max-w-[350px] md:max-w-[400px] relative overflow-hidden transition-colors duration-1000 ${isLightMode ? 'bg-white/70 border-white/60' : 'bg-slate-900/60 border-white/10'}`}>
            <button
              onClick={() => setShowJoinModal(false)}
              className={`absolute top-4 sm:top-6 right-4 sm:right-6 transition-colors ${isLightMode ? 'text-slate-400 hover:text-slate-800' : 'text-white/40 hover:text-white'}`}
            >
              <X size={20} className="sm:w-[24px] sm:h-[24px]" />
            </button>

            <h2 className={`text-left text-2xl sm:text-3xl font-bold mb-2 tracking-tight transition-colors duration-1000 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
              Join Game
            </h2>
            <p className={`text-left text-sm sm:text-base mb-6 sm:mb-8 font-medium transition-colors duration-1000 ${isLightMode ? 'text-slate-500' : 'text-white/50'}`}>
              Enter the game code provided by the moderator
            </p>

            <div className="relative group">
              <input
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value)}
                placeholder="GAME CODE"
                className={`
                  w-full text-center
                  border-2
                  rounded-2xl 
                  px-4 sm:px-5 
                  py-3 sm:py-4 
                  mb-6 sm:mb-8
                  text-lg sm:text-xl font-bold
                  tracking-[0.2em]
                  focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20
                  transition-all shadow-inner
                  ${isLightMode ? 'bg-white/50 border-slate-300 text-slate-800 placeholder-slate-400' : 'bg-white/5 border-white/10 text-white placeholder-white/20'}
                `}
              />
            </div>

            <button
              onClick={joinGame}
              disabled={joining}
              className="
                w-full 
                py-3 sm:py-4
                rounded-2xl
                bg-emerald-500 hover:bg-emerald-400
                text-white font-bold text-base sm:text-lg
                disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed
                shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-[1.02] active:scale-95
                transition-all duration-300
              "
            >
              {joining ? "Joining…" : "Join Game"}
            </button>
          </div>
        </div>
      )}
    </div>
  );}
