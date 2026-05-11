import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { apiUrl } from "../../../config/api";
import { useTheme } from "../../../context/ThemeContext";
import PageBackground from "../../../components/PageBackground";
import LiquidButton from "../../../components/LiquidButton";

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
    <PageBackground>
      <div
        className={`relative z-10 h-screen overflow-hidden flex flex-col p-4 sm:p-6 md:p-8 lg:p-10 transition-colors duration-1000 ${isLightMode ? 'text-slate-800' : 'text-white'}`}
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
          <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 relative z-20 overflow-hidden flex flex-col min-h-0">
            <div className={`flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 sm:space-y-8 py-4`}>
              {games.length === 0 ? (
                <div className={`text-center py-20 rounded-[2.5rem] border-2 border-dashed ${isLightMode ? 'border-slate-200 text-slate-400' : 'border-white/5 text-white/20'}`}>
                  <p className="text-xl font-black tracking-widest uppercase">No Active Sessions</p>
                </div>
              ) : (
                games.map((game) => (
                  <div
                    key={game.game_id}
                    className={`
                      relative overflow-hidden
                      backdrop-blur-3xl border-2
                      rounded-2xl sm:rounded-[2rem] 
                      p-4 sm:p-5 lg:p-6
                      flex flex-col sm:flex-row justify-between items-start sm:items-center
                      gap-4 sm:gap-6
                      hover:-translate-y-1 transition-all duration-700
                      ${isLightMode ? 'bg-white/70 hover:bg-white/90 border-white/60' : 'bg-white/5 hover:bg-white/10 border-white/10'}
                    `}
                  >
                    {/* Liquid Glow Inner */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />

                    <div className="min-w-0 flex-1 relative z-10">
                      <h2 className={`text-left text-lg sm:text-xl lg:text-2xl font-black mb-1 truncate transition-colors duration-1000 ${isLightMode ? 'text-slate-800' : 'text-white'}`} title={game.game_name}>
                        {game.game_name}
                      </h2>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${isLightMode ? 'bg-blue-100 text-blue-600' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'}`}>
                          {game.game_type}
                        </span>
                        <span className={`text-left text-[10px] sm:text-xs font-medium transition-colors duration-1000 ${isLightMode ? 'text-slate-400' : 'text-white/40'}`}>
                          Available to join
                        </span>
                      </div>
                    </div>

                    <LiquidButton
                      onClick={() => {
                        setSelectedGame(game);
                        openJoinModal();
                      }}
                      label="JOIN"
                      className="w-full sm:w-[140px] h-[45px] sm:h-[50px] text-xs sm:text-sm"
                      showArrow={false}
                      showPulse={false}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Join modal */}
        {showJoinModal && (
          <div className={`fixed inset-0 z-[1000] backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-500 ${isLightMode ? 'bg-slate-100/60' : 'bg-slate-950/80'}`}>
            <div className={`backdrop-blur-[40px] border p-8 sm:p-10 md:p-12 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] w-full max-w-[380px] sm:max-w-[420px] md:max-w-[480px] relative overflow-hidden transition-all duration-1000 ${isLightMode ? 'bg-white/80 border-white/60' : 'bg-slate-900/70 border-white/10'}`}>
              {/* Liquid Glow Inner */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

              <button
                onClick={() => setShowJoinModal(false)}
                className={`absolute top-6 right-6 transition-colors p-2 rounded-full hover:bg-white/10 ${isLightMode ? 'text-slate-400 hover:text-slate-800' : 'text-white/40 hover:text-white'}`}
              >
                <X size={24} />
              </button>

              <div className="text-left relative z-10">
                <h2 className={`text-3xl sm:text-4xl font-black mb-3 tracking-tight transition-colors duration-1000 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                  Join Game
                </h2>
                <p className={`text-sm sm:text-base mb-10 font-medium transition-colors duration-1000 ${isLightMode ? 'text-slate-500' : 'text-white/50'}`}>
                  Enter the game code provided by the moderator to synchronize with your team.
                </p>

                <div className="relative group mb-10">
                  <input
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value)}
                    placeholder="GAME CODE"
                    className={`
                      w-full text-center
                      border-2
                      rounded-3xl 
                      px-6 
                      py-4 sm:py-5 
                      text-xl sm:text-2xl font-black
                      tracking-[0.3em]
                      focus:outline-none focus:border-blue-400 focus:ring-[12px] focus:ring-blue-400/10
                      transition-all shadow-inner uppercase
                      ${isLightMode ? 'bg-white/50 border-slate-200 text-slate-800 placeholder-slate-300' : 'bg-white/5 border-white/10 text-white placeholder-white/10'}
                    `}
                  />
                  <div className="absolute bottom-0 left-10 right-10 h-[2px] bg-blue-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-center" />
                </div>

                <LiquidButton
                  onClick={joinGame}
                  disabled={joining}
                  label={joining ? "Synchronizing…" : "Join Game"}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </PageBackground>
  );
}
