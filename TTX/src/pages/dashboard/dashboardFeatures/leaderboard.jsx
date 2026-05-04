import React, { useEffect, useState, useMemo } from "react";
import { X, Trophy, PartyPopper } from "lucide-react";
import { apiUrl } from "../../../config/api";

export default function Leaderboard({ isOpen, onClose, gameId }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [showBanner, setShowBanner] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);

  const currentGroup = useMemo(() => {
    const stored = localStorage.getItem("currentGroup");
    return stored ? JSON.parse(stored).group : null;
  }, []);

  const getLevelMessage = (level) => {
    switch (level) {
      case 1:
        return "Nice Try!";
      case 2:
        return "Well Done!";
      case 3:
        return "Amazing!";
      case 4:
        return "Intelligent and Well Informed";
      default:
        return "Well Done!";
    }
  };

  useEffect(() => {
    if (isOpen && gameId) {
      loadLeaderboard();
      setShowBanner(true);
    }
  }, [isOpen, gameId]);

  const loadLeaderboard = async () => {
    try {
      // leaderboard
      const lbRes = await fetch(apiUrl(`/score/leaderboard/${gameId}`));
      if (!lbRes.ok) throw new Error(await lbRes.text());
      const lbData = await lbRes.json();
      setLeaderboard(lbData);

      // Calculate level based on current team's score
      if (currentGroup) {
        const teamScore =
          lbData.find((t) => t.group_id === currentGroup.group_id)
            ?.total_points || 0;
        let level = 0;
        if (teamScore >= 86) level = 4;
        else if (teamScore >= 71) level = 3;
        else if (teamScore >= 51) level = 2;
        else if (teamScore >= 1) level = 1;
        setCurrentLevel(level);
      }

      // breakdown
      const brRes = await fetch(apiUrl(`/score/breakdown/${gameId}`));
      if (!brRes.ok) throw new Error(await brRes.text());
      const brData = await brRes.json();
      setBreakdown(brData);
    } catch (err) {
      console.error("Failed to load leaderboard:", err.message);
      setLeaderboard([]);
      setBreakdown([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl w-[92%] max-w-3xl max-h-[92vh] overflow-y-auto overflow-x-hidden relative flex flex-col cursor-default border border-white/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Section - Now at the absolute top */}
        {showBanner && currentLevel > 0 && (
          <div className="sticky top-0 z-20 w-full bg-white">
            <div className="relative overflow-hidden bg-blue-600 p-3 sm:p-6 shadow-[0_4px_20px_rgba(37,99,235,0.2)] animate-[celebratePop_0.8s_cubic-bezier(0.34,1.56,0.64,1)]">
              {/* Shimmer Effect */}
              <div className="absolute inset-0 w-[200%] h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />

              <div className="relative z-10 flex items-center justify-center">
                <div className="text-center px-2">
                  <h3 className="text-white font-black text-lg sm:text-2xl lg:text-4xl uppercase tracking-tighter mb-0.5 sm:mb-2 drop-shadow-md animate-[zoomPulse_2s_infinite_ease-in-out]">
                    {getLevelMessage(currentLevel)}
                  </h3>
                  <p className="text-white font-bold text-xs sm:text-lg lg:text-2xl drop-shadow-sm">
                    Your Maturity Level is{" "}
                    <span className="text-yellow-300 underline underline-offset-2 sm:underline-offset-4 decoration-2">
                      Tier {currentLevel}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div
          className={`p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-[1.1fr_auto_1.4fr] gap-4 sm:gap-8 items-start`}
        >
          {/* LEFT: Overall Standings */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 border-b-2 border-gray-100 pb-2">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 uppercase tracking-tight">
                Standings
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {leaderboard.length === 0 ? (
                <p className="text-gray-500 text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  No scores recorded yet.
                </p>
              ) : (
                leaderboard.map((team, i) => {
                  const isUserTeam = currentGroup?.group_id === team.group_id;
                  const rank = i + 1;

                  return (
                    <div
                      key={team.group_id}
                      className={`
                        flex items-center justify-between p-2 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300
                        ${
                          isUserTeam
                            ? "bg-blue-500/10 border-2 border-blue-500/50 shadow-md ring-2 ring-blue-500/20"
                            : "bg-white/60 border-2 border-white/40 hover:border-white/80 hover:bg-white/80 shadow-sm"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div
                          className={`
      w-8 h-8 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-black text-base sm:text-xl shadow-sm
      ${rank === 1 ? "bg-gradient-to-br from-yellow-300 to-amber-500 text-white border-2 border-yellow-400 shadow-yellow-300/50" : ""}
      ${rank === 2 ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white border-2 border-gray-400 shadow-gray-300/50" : ""}
      ${rank === 3 ? "bg-gradient-to-br from-orange-300 to-orange-600 text-white border-2 border-orange-400 shadow-orange-300/50" : ""}
      ${rank > 3 ? "bg-gray-100 text-gray-600 border-2 border-gray-200" : ""}
    `}
                        >
                          {rank}
                        </div>

                        <div className="flex flex-col">
                          <p
                            className={`text-base sm:text-xl font-black leading-tight ${
                              isUserTeam ? "text-blue-900" : "text-gray-800"
                            }`}
                          >
                            {team.group_name}
                          </p>

                          {isUserTeam && (
                            <span className="text-[7px] sm:text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-[0.1em] font-black self-start mt-0.5 shadow-sm">
                              Your Team
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-lg sm:text-2xl font-black ${isUserTeam ? "text-blue-600" : "text-gray-900"}`}
                        >
                          {team.total_points}{" "}
                          <span className="text-[9px] sm:text-xs font-bold uppercase text-gray-400">
                            Pts
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* DIVIDER (Hidden on small screens) */}
          <div className="hidden lg:block w-[2px] bg-linear-to-b from-transparent via-gray-200 to-transparent self-stretch" />

          {/* RIGHT: Round-by-Round Breakdown */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 border-b-2 border-gray-100 pb-2">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 uppercase tracking-tight">
                Round Details
              </h2>
            </div>

            <div className="flex flex-col gap-8">
              {breakdown.length === 0 ? (
                <p className="text-gray-500 text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  No round breakdown available.
                </p>
              ) : (
                Object.entries(
                  breakdown.reduce((acc, row) => {
                    acc[row.round_number] ||= [];
                    acc[row.round_number].push(row);
                    return acc;
                  }, {}),
                )
                  .reverse()
                  .map(([round, rows]) => (
                    <div
                      key={round}
                      className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/40 overflow-hidden shadow-sm"
                    >
                      <div className="bg-white/50 px-4 py-2 border-b border-white/40 flex justify-between items-center">
                        <h3 className="text-lg font-black text-gray-800 uppercase tracking-wider">
                          Round {round}
                        </h3>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          Points
                        </span>
                      </div>
                      <div className="p-4 flex flex-col gap-3">
                        {rows.map((r, i) => {
                          const isUserTeam =
                            currentGroup?.group_id === r.group_id;
                          return (
                            <div
                              key={i}
                              className={`
                              flex justify-between items-center p-2 sm:p-3 rounded-xl transition-colors
                              ${isUserTeam ? "bg-blue-500/10 border border-blue-500/30" : "hover:bg-white/60"}
                            `}
                            >
                              <span
                                className={`text-sm sm:text-base font-bold ${isUserTeam ? "text-blue-900" : "text-gray-700"} truncate max-w-[100px] sm:max-w-none`}
                              >
                                {r.group_name}
                              </span>
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="flex flex-col items-end">
                                  <span className="text-[7px] sm:text-[10px] font-bold text-gray-400 uppercase leading-none mb-0.5">
                                    Base
                                  </span>
                                  <span className="text-xs sm:text-sm font-bold text-gray-600">
                                    {r.base_points}
                                  </span>
                                </div>
                                {r.bonus_points > 0 && (
                                  <div className="flex flex-col items-end">
                                    <span className="text-[7px] sm:text-[10px] font-bold text-blue-400 uppercase leading-none mb-0.5">
                                      Bonus
                                    </span>
                                    <span className="px-1 py-0.5 rounded-md bg-blue-500 text-white text-[9px] sm:text-xs font-black">
                                      +{r.bonus_points}
                                    </span>
                                  </div>
                                )}
                                <div className="h-5 sm:h-7 w-[1px] bg-gray-200 mx-0.5" />
                                <div className="flex flex-col items-end">
                                  <span className="text-[7px] sm:text-[10px] font-bold text-gray-800 uppercase leading-none mb-0.5">
                                    Total
                                  </span>
                                  <span
                                    className={`text-base sm:text-lg font-black ${isUserTeam ? "text-blue-600" : "text-gray-900"}`}
                                  >
                                    {r.total_points}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
