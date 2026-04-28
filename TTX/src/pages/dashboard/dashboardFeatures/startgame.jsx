import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy } from "lucide-react";
import confetti from "canvas-confetti";

import DropContainers from "../../../layouts/dropContainers";
import CardContainer from "../../../layouts/cardcontainers";
import ContainerModal from "../../../layouts/containerModal.jsx";
import Leaderboard from "./leaderboard";
import { apiUrl } from "../../../config/api";

import Board from "../../../images/Middle Board 1.png";
import GameBG from "../../../images/board-background.png";

export default function StartGame() {
  const navigate = useNavigate();
  const prevRoundEndedRef = React.useRef(false);
  const scoreLockRef = React.useRef(false);
  const droppedCardsRef = React.useRef({});
  const prevRoundIdRef = React.useRef(null);

  const [stopThreatAnim, setStopThreatAnim] = useState(false);

  const [group, setGroup] = useState(null);
  const [droppedCards, setDroppedCards] = useState({});
  const [isCardPanelOpen, setIsCardPanelOpen] = useState(false);
  const [openContainer, setOpenContainer] = useState(null);

  const [boardLocked, setBoardLocked] = useState(true);
  const [showBlocker, setShowBlocker] = useState(true);

  const [activeThreat, setActiveThreat] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [roundEnded, setRoundEnded] = useState(false);
  const [activeRoundNumber, setActiveRoundNumber] = useState(null);
  const [activeRoundId, setActiveRoundId] = useState(null);
  const [roundKey, setRoundKey] = useState(0);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const formatTime = (seconds) => {
    if (seconds == null) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  useEffect(() => {
    setStopThreatAnim(false);
  }, [activeRoundId, activeThreat?.description]);

  // detect round end
  useEffect(() => {
    if (remainingSeconds != null && remainingSeconds <= 0) {
      setRoundEnded(true);
    }
  }, [remainingSeconds]);

  // auto-submit answers
  useEffect(() => {
    const prev = prevRoundEndedRef.current;

    if (!prev && roundEnded && !isSubmitted) {
      setIsSubmitted(true);
    }

    prevRoundEndedRef.current = roundEnded;
  }, [roundEnded, isSubmitted]);

  useEffect(() => {
    const joinedGame = JSON.parse(localStorage.getItem("joinedGame"));
    if (!joinedGame) return;

    const gameId = joinedGame.game_id;

    const fetchRoundState = async () => {
      try {
        const res = await fetch(apiUrl(`/games/${gameId}/rounds`));
        const rounds = await res.json();

        const active = rounds.find((r) => r.is_started);

        if (!active && prevRoundIdRef.current) {
          console.log("ROUND ENDED:", prevRoundIdRef.current);
          setRoundEnded(true);
        }

        if (active) {
          const isNewRound = prevRoundIdRef.current !== active.round_id;

          if (isNewRound) {
            setDroppedCards({});
            setRoundEnded(false);
            setIsSubmitted(false);
            setShowLeaderboard(false);

            // lock until Start
            setBoardLocked(true);
            setShowBlocker(true);

            // fully reset card container
            setRoundKey((k) => k + 1);
          }

          setActiveRoundNumber(active.round_number);
          setActiveRoundId(active.round_id);
          setActiveThreat({
            threat_id: active.threat_id,
            description: active.threat_description,
          });

          setRemainingSeconds(
            active.remaining_seconds ?? active.duration_minutes * 60,
          );
        } else {
          setBoardLocked(true);
          setShowBlocker(true);
          setRemainingSeconds(null);
        }

        prevRoundIdRef.current = active ? active.round_id : null;
      } catch (err) {
        console.error("Failed to fetch round state", err);
      }
    };

    fetchRoundState();
    const interval = setInterval(fetchRoundState, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const storedGroup = localStorage.getItem("currentGroup");
    if (storedGroup) {
      const parsed = JSON.parse(storedGroup);
      setGroup(parsed.group);
    }
  }, []);

  // clear containers when new round starts
  useEffect(() => {
    droppedCardsRef.current = droppedCards;
  }, [droppedCards]);

  // reset score lock when a new round starts
  useEffect(() => {
    scoreLockRef.current = false;
  }, [activeRoundId]);

  // finalize round when it ends
  useEffect(() => {
    if (!roundEnded || !activeRoundId) return;

    fetch(apiUrl(`/round/${activeRoundId}/finalize`), {
      method: "POST",
    }).catch((err) => console.error("Failed to finalize round", err));
  }, [roundEnded, activeRoundId]);

  const placeCardBackend = async (cardId) => {
    if (!activeRoundId || !group) return;

    try {
      await fetch(apiUrl("/round-card-selection"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          round_id: activeRoundId,
          group_id: group.group_id,
          card_id: cardId,
        }),
      });
    } catch (err) {
      console.error("Failed to persist card placement", err);
    }
  };

  const submitAnswers = async () => {
    if (!group || !activeRoundId) return;

    try {
      await fetch(apiUrl(`/round/${activeRoundId}/submit`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_id: group.group_id }),
      });

      setIsSubmitted(true);
      setBoardLocked(true);
      setShowSubmitConfirm(false);
    } catch (err) {
      console.error("Submit answers failed", err);
    }
  };
  // 🎉 CONFETTI BEFORE SHOWING LEADERBOARD
  const celebrateAndShowLeaderboard = () => {
    // Open leaderboard instantly
    setShowLeaderboard(true);

    // Fire a strong burst immediately
    confetti({
      particleCount: 200,
      spread: 120,
      startVelocity: 45,
      origin: { y: 0.6 },
    });

    // Optional: small extra bursts without delaying UI
    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { x: 0.2, y: 0.5 },
      });
    }, 200);

    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { x: 0.8, y: 0.5 },
      });
    }, 400);
  };

  const answerCardIds = useMemo(() => {
    if (!activeThreat?.answers) return new Set();

    return new Set(activeThreat.answers.map((a) => Number(a.card_id)));
  }, [activeThreat]);

  const leaderboardGameId = useMemo(() => {
    const joinedGame = JSON.parse(localStorage.getItem("joinedGame"));
    return joinedGame?.game_id ?? null;
  }, []);

  return (
    <div className="relative w-screen min-h-screen overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm scale-105 z-0"
        style={{ backgroundImage: `url(${GameBG})` }}
      />
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      <div className="relative z-10 bg-gray-100/20 min-h-screen">
        {/* Top Action Buttons */}
        <div className="fixed top-4 md:top-6 left-4 md:left-6 right-4 md:right-6 z-[70] flex justify-between gap-3">
          {roundEnded && (
            <button
              onClick={() => navigate("/GameList")}
              className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full
                      bg-white/80 hover:bg-white backdrop-blur-xl
                      text-slate-700 font-medium shadow-md
                      transition text-sm md:text-base"
            >
              <ArrowLeft size={16} className="md:w-5 md:h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          {roundEnded && (
            <button
              onClick={celebrateAndShowLeaderboard}
              className="flex items-center gap-2 px-3 md:px-5 py-2 rounded-full
                      bg-indigo-100 hover:bg-indigo-200
                      text-slate-900 font-semibold shadow-md
                      transition text-sm md:text-base ml-auto"
            >
              <Trophy size={16} className="md:w-5 md:h-5" />
              <span>Leaderboard</span>
            </button>
          )}
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 px-4 md:px-8 pt-6 pb-4">
          {/* Active Round */}
          {activeRoundNumber != null && (
            <div
              className="text-slate-800 font-bold lg:text-lg md:text-md
                  bg-white/60 backdrop-blur-xl
                   border border-white/40
                   lg:rounded-2xl md:rounded-xl px-4 py-2 "
            >
              Round {activeRoundNumber}
            </div>
          )}

          {/* Team Name */}
          <h1
            className="text-2xl md:text-xl lg:text-3xl font-bold tracking-tight
                  text-slate-800
                  bg-white/60 backdrop-blur-xl
                  border border-white/40
                  px-6 lg:py-3 md:px-8 md:py-1   lg:rounded-2xl md:rounded-xl
                  shadow-[0_10px_30px_rgba(0,0,0,0.15)] text-center md:text-left"
          >
            {group ? `Team ${group.group_name}` : "Loading team..."}
          </h1>

          {/* Round Timer */}
          <div
            className="  text-slate-800
                  bg-white/60 backdrop-blur-xl
                  border border-white/40
                   lg:rounded-2xl md:rounded-xl "
          >
            <div
              className={`px-4 py-2 text-slate-800 font-mono font-bold lg:text-lg md:text-lg rounded-xl ${
                remainingSeconds != null && remainingSeconds <= 10
                  ? "text-red-600 animate-pulse shadow-[0_0_30px_rgba(255,0,0,0.8)] bg-red-50"
                  : "text-red-600"
              }`}
            >
              {formatTime(remainingSeconds)}
            </div>
          </div>
        </div>

        {/* Threat Section */}
        <div className="mb-6 px-4 flex justify-center">
          <p className="font-semibold text-base md:text-lg lg:text-xl bg-green-800 text-white px-4 py-1 max-w-7xl w-full rounded-lg">
            <span className={!stopThreatAnim ? "threat-zoom" : ""}>
              {activeThreat?.description ?? "Waiting for threat…"}
            </span>
          </p>
        </div>

        <div className="relative px-4 md:px-6">
          {/* Gameplay grid - Responsive Layout */}
          <div
            className={`grid grid-cols-1 md:grid-cols-[200px_1fr_200px] lg:grid-cols-[260px_1fr_260px] gap-6 md:gap-8 lg:gap-12 items-start
            ${boardLocked ? "pointer-events-none opacity-60" : ""}`}
          >
            {/* Left - Hidden on mobile, shown on md+ */}
            <div className="hidden md:flex justify-end">
              <DropContainers
                side="left"
                droppedCards={droppedCards}
                setDroppedCards={setDroppedCards}
                onOpenContainer={setOpenContainer}
                locked={isSubmitted}
                onCardPlaced={placeCardBackend}
              />
            </div>

            {/* Center Board */}
            <div className="relative flex flex-col items-center">
              <img
                src={Board}
                alt="Board"
                className="w-full max-w-2xl md:max-w-4xl lg:max-w-5xl rounded-lg md:rounded-xl shadow-lg md:shadow-xl bg-white/10"
              />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-6 mt-6 md:mt-10 w-full md:w-auto mb-4">
                <button
                  onClick={() => setIsCardPanelOpen(true)}
                  className="px-4 py-2 md:px-5 md:py-3 flex-1 md:w-40 rounded-full
                          bg-blue-700 hover:bg-blue-800 active:bg-blue-900
                          text-white font-semibold text-sm md:text-base transition"
                >
                  Add Card
                </button>

                <button
                  onClick={() => {
                    setStopThreatAnim(true); // stop zoom animation
                    setShowSubmitConfirm(true); // keep your existing behavior
                  }}
                  disabled={isSubmitted || roundEnded}
                  className={`px-4 py-2 md:px-5 md:py-3 flex-1 md:w-40 rounded-full font-semibold text-sm md:text-base transition
                  ${isSubmitted || roundEnded ? "bg-gray-400 cursor-not-allowed text-gray-600" : "bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white"}`}
                >
                  {isSubmitted ? "Submitted" : "Submit"}
                </button>
              </div>
            </div>

            {/* Right - Hidden on mobile, shown on md+ */}
            <div className="hidden md:flex flex-col items-start gap-6">
              <DropContainers
                side="right"
                droppedCards={droppedCards}
                setDroppedCards={setDroppedCards}
                onOpenContainer={setOpenContainer}
                locked={isSubmitted}
                onCardPlaced={placeCardBackend}
              />
            </div>
          </div>

          {/* Mobile Bottom Containers - Show on mobile, hidden on md+ */}
          <div className="grid grid-cols-2 gap-4 mt-6 md:hidden">
            <div className="col-span-1">
              <DropContainers
                side="left"
                droppedCards={droppedCards}
                setDroppedCards={setDroppedCards}
                onOpenContainer={setOpenContainer}
                locked={isSubmitted}
                onCardPlaced={placeCardBackend}
              />
            </div>
            <div className="col-span-1">
              <DropContainers
                side="right"
                droppedCards={droppedCards}
                setDroppedCards={setDroppedCards}
                onOpenContainer={setOpenContainer}
                locked={isSubmitted}
                onCardPlaced={placeCardBackend}
              />
            </div>
          </div>
        </div>

        {/* Blocker Modal */}
        {showBlocker && (
          <div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md
                      flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl text-center w-full max-w-sm relative">
              <h2 className="text-left text-xl md:text-2xl font-bold mb-2">
                Stop right there!
              </h2>

              <p className="text-left text-gray-600 mb-6 text-sm md:text-base">
                Waiting for the moderator to start the round
              </p>

              <button
                disabled={!activeRoundId || roundEnded}
                onClick={() => {
                  setShowBlocker(false);
                  setBoardLocked(false);
                }}
                className={`w-full py-3 rounded-full font-semibold transition text-sm md:text-base
                ${!activeRoundId || roundEnded ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#2EE58A] hover:bg-[#23c877] text-white"}`}
              >
                Start
              </button>
            </div>
          </div>
        )}

        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-sm shadow-xl text-center">
              <h2 className="text-left text-lg md:text-xl font-bold mb-3">
                Submit your answers?
              </h2>

              <p className="text-left text-gray-600 mb-6 text-sm md:text-base">
                Once submitted, you won't be able to add or remove cards.
              </p>

              <div className="flex gap-3 md:gap-4">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 py-2 md:py-3 rounded-full text-sm md:text-base
                          bg-gray-200 hover:bg-gray-300
                          text-gray-700 font-semibold transition"
                >
                  Cancel
                </button>

                <button
                  onClick={submitAnswers}
                  className="flex-1 py-2 md:py-3 rounded-full text-sm md:text-base
                          bg-emerald-500 hover:bg-emerald-600
                          text-white font-semibold transition"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Card Panel*/}
        <CardContainer
          key={roundKey}
          isOpen={isCardPanelOpen}
          toggleOpen={() => setIsCardPanelOpen(false)}
        />

        {/* Container Modal */}
        {openContainer && (
          <ContainerModal
            container={openContainer}
            cards={droppedCards[openContainer.id] || []}
            answerCardIds={answerCardIds}
            locked={isSubmitted}
            onClose={() => setOpenContainer(null)}
            onRemoveCard={(cardId) => {
              if (isSubmitted) return;

              setDroppedCards((prev) => ({
                ...prev,
                [openContainer.id]: prev[openContainer.id].filter(
                  (c) => c.card_id !== cardId,
                ),
              }));

              window.dispatchEvent(
                new CustomEvent("cardRestore", { detail: cardId }),
              );
            }}
          />
        )}
      </div>

      {/* Leaderboard Modal */}
      <Leaderboard
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        gameId={leaderboardGameId}
      />
    </div>
  );
}
