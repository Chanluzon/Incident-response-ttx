import React, { useEffect, useState } from "react";
import { X, ArrowLeft, Trash2, Trophy } from "lucide-react";
import ThreatRandomizerModal from "./threatRandomizerModal";
import { apiUrl } from "../../../config/api";

export default function GameSettingsModal({
  show,
  onCloseRequest,
  showToast,
  confirmToast,
  logActivity,
  refreshDashboard,
}) {
  const [visible, setVisible] = useState(false);

  // joined groups modal
  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  // main states
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // game details
  const [view, setView] = useState("list");
  const [activeGame, setActiveGame] = useState(null);

  // round states
  const [rounds, setRounds] = useState([]);
  const usedThreatIds = rounds.map((r) => r.game_threat_id);
  const [roundSearch, setRoundSearch] = useState("");
  const [showThreatRandomizer, setShowThreatRandomizer] = useState(false);

  // leaderboard modal
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // result modal
  const [showResultModal, setShowResultModal] = useState(false);
  const [roundResult, setRoundResult] = useState([]);
  const [activeResultRound, setActiveResultRound] = useState(null);

  // show/hide modal
  useEffect(() => {
    if (show) {
      setVisible(true);
    } else {
      setVisible(false);
      setView("list");
      setActiveGame(null);
      setRounds([]);
      setRoundSearch("");
    }
  }, [show]);

  // load games
  useEffect(() => {
    if (!visible) return;

    const fetchGames = async () => {
      try {
        const res = await fetch(apiUrl("/games"));
        const data = await res.json();
        setGames(data);
      } catch (err) {
        console.error("Error fetching games:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [visible]);

  useEffect(() => {
    if (!activeGame) return;

    const hasActiveRound = rounds.some(
      (r) => r.is_started && r.status === "active",
    );

    if (!hasActiveRound) return;

    const interval = setInterval(() => {
      loadRounds(activeGame.game_id);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeGame, rounds]);

  if (!visible) return null;

  const deleteGame = async (id) => {
    const confirmed = await confirmToast("Delete this game?");
    if (!confirmed) return;

    const gameToDelete = games.find((g) => g.game_id === id);

    await fetch(apiUrl(`/games/${id}`), {
      method: "DELETE",
    });

    setGames((prev) => prev.filter((g) => g.game_id !== id));

    if (activeGame && activeGame.game_id === id) {
      setView("list");
      setActiveGame(null);
    }

    showToast("Game deleted!", "success");
    refreshDashboard();

    if (gameToDelete) {
      logActivity(`Deleted game "${gameToDelete.game_name}"`, "delete");
    }
  };

  // load rounds
  const loadRounds = async (gameId) => {
    try {
      const res = await fetch(apiUrl(`/games/${gameId}/rounds`));
      const data = await res.json();
      setRounds(data);
    } catch (err) {
      console.error("Error loading rounds:", err);
    }
  };

  // round actions
  const startRound = async (roundId) => {
    const confirmed = await confirmToast("Start this round?");
    if (!confirmed) return;

    const res = await fetch(apiUrl(`/round/${roundId}/start`), {
      method: "PUT",
    });

    if (!res.ok) {
      showToast("Failed to start round", "error");
      return;
    }

    await loadRounds(activeGame.game_id);

    showToast("Round started!", "success");

    logActivity(`Started a round in "${activeGame.game_name}"`, "success");

    refreshDashboard();
  };

  const restartRound = async (roundId) => {
    const confirmed = await confirmToast("Restart this round timer?");
    if (!confirmed) return;

    const res = await fetch(apiUrl(`/round/${roundId}/restart`), {
      method: "PUT",
    });

    if (!res.ok) {
      showToast("Failed to restart round", "error");
      return;
    }

    await loadRounds(activeGame.game_id);
    refreshDashboard();
    showToast("Round restarted!", "success");
  };

  const endRound = async (roundId) => {
    const confirmed = await confirmToast("End this round?");
    if (!confirmed) return;

    const res = await fetch(apiUrl(`/round/${roundId}/end`), {
      method: "PUT",
    });

    if (!res.ok) {
      showToast("Failed to end round", "error");
      return;
    }

    await loadRounds(activeGame.game_id);
    refreshDashboard();
    showToast("Round ended!", "success");
  };

  // view result
  const viewResult = async (round) => {
    try {
      const res = await fetch(apiUrl(`/score/breakdown/${activeGame.game_id}`));

      if (!res.ok) {
        showToast("Failed to load round results", "error");
        return;
      }

      const data = await res.json();

      //filter only the selected round
      const roundOnly = Array.isArray(data)
        ? data
            .filter(
              (row) => Number(row.round_number) === Number(round.round_number),
            )
            .sort((a, b) => b.total_points - a.total_points)
        : [];

      setActiveResultRound(round.round_number);
      setRoundResult(roundOnly);
      setShowResultModal(true);
    } catch (err) {
      console.error(err);
      showToast("Error loading results", "error");
    }
  };

  const loadJoinedGroups = async (gameId) => {
    setGroupsLoading(true);
    try {
      const res = await fetch(apiUrl(`/game-group/${gameId}/groups`));
      const data = await res.json();
      setJoinedGroups(data);
    } catch (err) {
      console.error("Error loading joined groups:", err);
      showToast("Failed to load groups", "error");
    } finally {
      setGroupsLoading(false);
    }
  };

  // add round
  const addRound = async () => {
    setShowThreatRandomizer(true);
  };

  const handleThreatConfirmed = async ({ threat, duration_minutes, bonus }) => {
    setShowThreatRandomizer(false);

    const confirmed = await confirmToast(
      `Use "${threat.description}" for this round?`,
    );
    if (!confirmed) return;

    try {
      // determine next round number
      const nextRoundNumber =
        rounds.length > 0
          ? Math.max(...rounds.map((r) => r.round_number)) + 1
          : 1;

      // create game threat
      const resGT = await fetch(apiUrl("/game-threat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_id: activeGame.game_id,
          threat_id: threat.threat_id,
          order_num: nextRoundNumber,
        }),
      });

      if (!resGT.ok) {
        showToast("Failed to assign threat", "error");
        return;
      }

      const gameThreat = await resGT.json();

      // create round
      const newRound = {
        round_number: nextRoundNumber,
        game_id: activeGame.game_id,
        game_threat_id: gameThreat.game_threat_id,
        duration_minutes,
      };

      const resRound = await fetch(apiUrl("/round"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newRound,
          first_submit_bonus: bonus,
        }),
      });

      if (!resRound.ok) {
        showToast("Failed to create round", "error");
        return;
      }

      await loadRounds(activeGame.game_id);

      showToast("Round created!", "success");

      logActivity(
        `Added Round ${nextRoundNumber} to "${activeGame.game_name}"`,
        "success",
      );

      refreshDashboard();
    } catch (err) {
      console.error(err);
      showToast("Error creating round", "error");
    }
  };

  // filter
  const filteredGames = games.filter((g) => {
    const s = searchTerm.toLowerCase();
    return (
      g.game_name.toLowerCase().includes(s) ||
      g.game_type.toLowerCase().includes(s) ||
      g.status.toLowerCase().includes(s)
    );
  });

  const filteredRounds = rounds.filter((r) => {
    const s = roundSearch.toLowerCase();
    return (
      `${r.round_number}`.includes(s) ||
      r.status.toLowerCase().includes(s) ||
      `${r.game_threat_id}`.includes(s)
    );
  });

  const hasActiveRound = rounds.some((r) => r.is_started);

  const openDetails = (game) => {
    setActiveGame(game);
    setView("details");
    loadRounds(game.game_id);
  };

  const goBack = () => {
    setView("list");
    setActiveGame(null);
    setRounds([]);
    setRoundSearch("");
  };

  // game list
  const renderGameList = () => (
    <>
      <h2 className="text-2xl font-bold mb-2">Game Settings</h2>
      <p className="text-gray-500 text-sm mb-6">Manage games & rounds.</p>

      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search games"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="ml-0.5 border border-gray-300 rounded-md px-4 py-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-[#2EE58A]"
        />
        <span className="text-sm text-gray-500">
          {filteredGames.length} games
        </span>
      </div>

      <div className="space-y-4 overflow-y-auto flex-1 pr-2 pb-6">
        {loading ? (
          <p className="text-center text-gray-500 mt-10">Loading games...</p>
        ) : filteredGames.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No games found.</p>
        ) : (
          filteredGames.map((game) => (
            <div
              key={game.game_id}
              onClick={(e) => {
                if (e.target.tagName === "BUTTON") return;
                openDetails(game);
              }}
              className="cursor-pointer flex justify-between items-center bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
            >
              <div>
                <h3 className="font-semibold text-gray-800">
                  {game.game_name}
                </h3>

                <p className="text-sm text-gray-500 capitalize">
                  {game.game_type}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      game.status === "active"
                        ? "bg-green-500"
                        : game.status === "pending"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  />
                  <span className="text-xs font-medium text-gray-700">
                    {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Game Code */}
                {game.game_code && (
                  <>
                    <span
                      className="px-3 h-7 rounded-full
                                bg-green-100 text-green-700
                                text-xs font-mono font-semibold
                                border border-green-200
                                flex items-center justify-center"
                    >
                      {game.game_code}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        loadJoinedGroups(game.game_id);
                        setShowGroupsModal(true);
                      }}
                      className="px-3 py-2 rounded-full
                                bg-blue-100 hover:bg-blue-200
                                text-blue-700 text-xs font-semibold"
                    >
                      Groups
                    </button>
                  </>
                )}

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteGame(game.game_id);
                  }}
                  className="px-3 py-2 rounded-full
                        bg-red-100 hover:bg-red-200
                        text-red-700 text-xs font-semibold
                        flex items-center gap-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );

  // game details
  const renderGameDetails = () => (
    <>
      <div className="w-full text-left">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-2 text-gray-600 mb-3 -ml-4.5 -mt-10"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-3xl font-bold">{activeGame.game_name}</h2>
          <p className="text-gray-500 text-sm capitalize">
            {activeGame.game_type}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Game Code */}
          {activeGame.game_code && (
            <span
              className="px-4 py-2 h-8 rounded-full
                        bg-green-100 text-green-700
                        text-sm font-mono font-semibold
                        select-all
                        flex items-center justify-center"
              title="Game Code"
            >
              {activeGame.game_code}
            </span>
          )}

          <button
            onClick={() => {
              loadJoinedGroups(activeGame.game_id);
              setShowGroupsModal(true);
            }}
            className="px-4 py-2 h-8 rounded-full
                      bg-blue-100 hover:bg-blue-200
                      text-blue-700 text-sm font-semibold
                      flex items-center justify-center"
          >
            View Groups
          </button>

          {/* Delete Game */}
          <button
            onClick={() => deleteGame(activeGame.game_id)}
            className="px-5 py-2 rounded-full
                      bg-red-100 hover:bg-red-200
                      text-red-700 text-sm font-semibold
                      flex items-center gap-1"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="mb-6 flex items-center justify-between">
        <input
          type="text"
          placeholder="Search rounds"
          value={roundSearch}
          onChange={(e) => setRoundSearch(e.target.value)}
          className="ml-0.5 border border-gray-300 rounded-md px-4 py-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-[#2EE58A]"
        />

        {/* Add Round + Leaderboard */}
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              const res = await fetch(
                apiUrl(`/score/leaderboard/${activeGame.game_id}`),
              );
              const data = await res.json();
              setLeaderboard(data);
              setShowLeaderboard(true);
            }}
            className="px-8 py-2 rounded-full h-9.5
                    bg-indigo-100 hover:bg-indigo-200
                    text-indigo-700 font-semibold
                    flex items-center gap-2"
            title="View leaderboard"
          >
            <Trophy size={18} />
          </button>

          <button
            onClick={addRound}
            className="px-8 py-2 bg-[#2EE58A] hover:bg-[#23c877]
                    text-white rounded-full text-sm font-semibold whitespace-nowrap"
          >
            Add Round
          </button>

          <p className="text-sm text-gray-500 whitespace-nowrap">
            {filteredRounds.length} rounds
          </p>
        </div>
      </div>

      {/* Rounds List */}
      <div className="space-y-4 overflow-y-auto h-[370px] pr-2">
        {filteredRounds.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            No rounds found for this game.
          </p>
        ) : (
          filteredRounds.map((r) => (
            <div
              key={r.round_id}
              className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
            >
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">
                  Round {r.round_number}
                </h3>

                <p className="text-sm text-gray-500">
                  Threat: {r.threat_description}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      r.status === "active"
                        ? "bg-green-500"
                        : r.status === "pending"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  />
                  <span className="text-xs font-medium text-gray-700">
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Round Duration */}
                <div className="flex items-center gap-2">
                  <span
                    className="px-3 py-2 h-8 rounded-full bg-purple-100 text-purple-700 
                                  text-xs font-semibold whitespace-nowrap"
                  >
                    {r.is_started && r.remaining_seconds != null
                      ? `${String(Math.floor(r.remaining_seconds / 60)).padStart(2, "0")}:${String(
                          r.remaining_seconds % 60,
                        ).padStart(2, "0")}`
                      : `${String(r.duration_minutes).padStart(2, "0")}:00`}
                  </span>

                  {r.is_started && (
                    <button
                      onClick={() => restartRound(r.round_id)}
                      className="px-3 py-2 rounded-full bg-yellow-100 hover:bg-yellow-200
                                text-yellow-700 text-xs font-semibold"
                      title="Restart timer"
                    >
                      Restart
                    </button>
                  )}
                </div>

                {!r.is_started && r.status === "pending" && (
                  <button
                    onClick={() => startRound(r.round_id)}
                    disabled={hasActiveRound}
                    className={`px-4 py-2 rounded-full text-xs font-semibold
                      ${
                        !hasActiveRound
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                  >
                    Start
                  </button>
                )}

                {r.is_started && (
                  <button
                    onClick={() => endRound(r.round_id)}
                    className="px-4 py-2 rounded-full bg-red-100 hover:bg-red-200 
                              text-red-700 text-xs font-semibold"
                  >
                    End
                  </button>
                )}

                {r.status === "ended" && (
                  <button
                    onClick={() => viewResult(r)}
                    className="px-4 py-2 rounded-full bg-blue-100 hover:bg-blue-200 
                              text-blue-700 text-xs font-semibold"
                  >
                    View Result
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );

  // main
  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-[9999]">
      <div
        className="bg-white rounded-2xl shadow-2xl w-[850px] h-[650px] p-8 relative text-left 
            transform transition-all duration-300 scale-95 opacity-0 
            animate-[fadeIn_0.25s_ease-out_forwards]"
      >
        <div className="flex flex-col h-full overflow-hidden">
          <button
            onClick={onCloseRequest}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>

          {view === "list" ? renderGameList() : renderGameDetails()}
        </div>

        {showGroupsModal && (
          <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-[1000]">
            <div className="bg-white rounded-2xl shadow-xl w-[600px] min-h-[500px] p-6 relative">
              <button
                onClick={() => setShowGroupsModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>

              <h3 className="text-xl font-bold mb-4">Joined Groups</h3>

              {groupsLoading ? (
                <p className="text-gray-500 text-center mt-10">
                  Loading groups...
                </p>
              ) : joinedGroups.length === 0 ? (
                <p className="text-gray-500 text-center mt-10">
                  No groups have joined yet.
                </p>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-[420px] pr-2">
                  {joinedGroups.map((group) => (
                    <div
                      key={group.group_id}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <h4 className="font-semibold text-gray-800">
                        {group.group_name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Leader: {group.leader_name}
                      </p>
                      {group.joined_at && (
                        <p className="text-xs text-gray-400 mt-1">
                          Joined: {new Date(group.joined_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {showLeaderboard && (
          <div className="fixed inset-0 z-[1000] bg-white/20 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-[520px] max-w-full h-96 p-6 relative flex flex-col border border-black/5">
              <button
                onClick={() => setShowLeaderboard(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
              >
                <X size={18} />
              </button>

              <h3 className="text-xl font-extrabold tracking-tight mb-4">
                Leaderboard
              </h3>

              {leaderboard.length === 0 ? (
                <p className="text-gray-500 text-center mt-10">
                  No scores yet.
                </p>
              ) : (
                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                  {leaderboard.map((team, index) => {
                    const rank = index + 1;

                    const badge =
                      rank === 1
                        ? "bg-yellow-400 text-white border-yellow-500"
                        : rank === 2
                          ? "bg-slate-400 text-white border-slate-500"
                          : rank === 3
                            ? "bg-orange-500 text-white border-orange-600"
                            : "bg-gray-100 text-gray-700 border-gray-300";

                    return (
                      <div
                        key={team.group_id}
                        className="group flex items-center justify-between rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-[0_8px_25px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.10)] hover:-translate-y-[1px] transition"
                      >
                        {/* Left: badge + name */}
                        <div className="flex items-center gap-4 min-w-0">
                          <div
                            className={[
                              "w-10 h-10 rounded-full grid place-items-center font-extrabold border-2 ring-2 ring-white",
                              badge,
                            ].join(" ")}
                          >
                            {rank}
                          </div>

                          <div className="min-w-0">
                            <div className="font-extrabold text-gray-900 truncate">
                              {team.group_name}
                            </div>
                          </div>
                        </div>

                        {/* Right: score */}
                        <div className="text-right shrink-0">
                          <div className="text-2xl font-extrabold text-gray-900 leading-none tabular-nums">
                            {team.total_points}
                          </div>
                          <div className="text-xs font-semibold tracking-widest text-gray-400">
                            PTS
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Optional: subtle footer fade */}
              <div className="pointer-events-none absolute left-6 right-6 bottom-6 h-8 bg-gradient-to-t from-white to-transparent rounded-b-3xl" />
            </div>
          </div>
        )}

        {showResultModal && (
          <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl w-[540px] max-w-full h-[460px] relative flex flex-col overflow-hidden">
              {/* Header with subtle gradient */}
              <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                <button
                  onClick={() => setShowResultModal(false)}
                  className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition"
                >
                  <X size={18} />
                </button>

                <h3 className="text-2xl font-extrabold tracking-tight text-gray-900">
                  Round {activeResultRound}
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                  Final Score Breakdown
                </p>
              </div>

              {roundResult.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 font-medium">
                  No data available.
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                  {[...roundResult]
                    .sort((a, b) => b.total_points - a.total_points)
                    .map((row, i) => {
                      const rank = i + 1;

                      const badgeStyle =
                        rank === 1
                          ? "bg-yellow-400 text-white border-yellow-500 shadow-lg"
                          : rank === 2
                            ? "bg-slate-400 text-white border-slate-500 shadow-md"
                            : rank === 3
                              ? "bg-orange-500 text-white border-orange-600 shadow-md"
                              : "bg-gray-100 text-gray-600 border-gray-300";

                      return (
                        <div
                          key={`${row.group_id ?? row.group_name}-${i}`}
                          className="group flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition"
                        >
                          {/* Left Side */}
                          <div className="flex items-center gap-4 min-w-0">
                            <div
                              className={[
                                "w-10 h-10 rounded-full grid place-items-center font-bold border-2",
                                badgeStyle,
                              ].join(" ")}
                            >
                              {rank}
                            </div>

                            <div className="font-semibold text-gray-800 truncate">
                              {row.group_name}
                            </div>
                          </div>

                          {/* Points */}
                          <div className="text-right">
                            <div className="text-2xl font-extrabold text-gray-900 tabular-nums">
                              {row.total_points}
                            </div>
                            <div className="text-xs font-semibold tracking-widest text-gray-400">
                              PTS
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Soft bottom fade */}
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
            </div>
          </div>
        )}
      </div>
      <ThreatRandomizerModal
        show={showThreatRandomizer}
        onClose={() => setShowThreatRandomizer(false)}
        //gameId={activeGame?.game_id}
        showToast={showToast}
        usedThreatIds={usedThreatIds}
        onSelectThreat={handleThreatConfirmed}
      />
    </div>
  );
}
