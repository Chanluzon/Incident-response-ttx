import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy } from "lucide-react";
import confetti from "canvas-confetti";
import { useTheme } from "../../../context/ThemeContext";

import CircularDropContainers from "../../../layouts/CircularDropContainers";
import DropContainers from "../../../layouts/dropContainers";
import CardContainer from "../../../layouts/cardcontainers";
import ContainerModal from "../../../layouts/containerModal.jsx";
import Leaderboard from "./leaderboard";
import { apiUrl } from "../../../config/api";
import { dropContainers } from "../../../layouts/dropContainers.config";

import Board from "../../../images/lock.png";
import WorldtechLogo from "../../../images/Worldtech 2.png";
import GameBG from "../../../images/board-background.png";
import AnimatedLogoBackground from "../../../layouts/AnimatedLogoBackground";


export default function StartGame() {
  const navigate = useNavigate();
  const { isLightMode } = useTheme();
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

  // PERSISTENCE: Fetch existing selections when round/group changes
  useEffect(() => {
    if (!activeRoundId || !group) return;

    const fetchSelections = async () => {
      try {
        const res = await fetch(
          apiUrl(
            `/round-card-selection/round/${activeRoundId}/group/${group.group_id}`,
          ),
        );
        const data = await res.json();

        // Map selections to containers
        const mapping = {};
        data.forEach((selection) => {
          const container = dropContainers.find(
            (c) => c.category === selection.category,
          );
          if (container) {
            if (!mapping[container.id]) mapping[container.id] = [];
            mapping[container.id].push(selection);
          }
        });
        setDroppedCards(mapping);
      } catch (err) {
        console.error("Failed to fetch selections", err);
      }
    };

    const checkSubmissionStatus = async () => {
      try {
        const res = await fetch(apiUrl(`/round/${activeRoundId}/submission/${group.group_id}`));
        const data = await res.json();
        if (data.isSubmitted) {
          setIsSubmitted(true);
          setBoardLocked(true);
        }
      } catch (err) {
        console.error("Failed to check submission status", err);
      }
    };

    fetchSelections();
    checkSubmissionStatus();
  }, [activeRoundId, group]);

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

  const hasStartedRound = activeRoundId && group && JSON.parse(localStorage.getItem("startedRounds") || "[]").includes(`${group.group_id}_${activeRoundId}`);

  return (
    <div className={`relative w-screen min-h-screen overflow-hidden transition-colors duration-1000 ${isLightMode ? 'bg-slate-50' : 'bg-slate-950'}`}>
      <div className={`absolute inset-0 z-0 transition-all duration-1000 bg-gradient-to-br ${isLightMode ? 'from-slate-100 via-blue-50 to-slate-200' : 'from-slate-900 via-blue-900 to-indigo-950'}`} />
      
      {/* Animated Logo Background */}
      
      {/* Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden z-0 opacity-40">
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-float transition-colors duration-1000 ${isLightMode ? 'bg-blue-300/40' : 'bg-blue-600/30'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] animate-morph transition-colors duration-1000 ${isLightMode ? 'bg-indigo-300/30' : 'bg-indigo-600/20'}`} />
        <div className={`absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full blur-[100px] animate-float [animation-delay:2s] transition-colors duration-1000 ${isLightMode ? 'bg-cyan-300/20' : 'bg-cyan-600/20'}`} />
      </div>

      <div className={`relative z-10 min-h-screen backdrop-blur-md transition-colors duration-1000 ${isLightMode ? 'bg-white/30 text-slate-800' : 'bg-white/10 text-white'}`}>
        {/* Animated Logo Background — above blur layers */}
        <AnimatedLogoBackground />

        {/* Top Action Buttons */}
        <div className="fixed top-4 md:top-6 left-4 md:left-6 right-4 md:right-6 z-[150] flex justify-between gap-3">
          {roundEnded && (
            <button
              onClick={() => navigate("/GameList")}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-full
                      backdrop-blur-xl transition text-sm md:text-base shadow-md
                      ${isLightMode 
                        ? 'bg-white/50 hover:bg-white/80 text-slate-600 hover:text-slate-900 border border-slate-300 shadow-[0_0_20px_rgba(0,0,0,0.05)]' 
                        : 'bg-white/80 hover:bg-white text-slate-700 font-medium'}`}
            >
              <ArrowLeft size={16} className="md:w-5 md:h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}


        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 px-4 md:px-8 pt-2 pb-2">
          {/* Logo Section */}
          <div className="flex items-center">
            <img src={WorldtechLogo} alt="Worldtech" className="h-8 md:h-12 lg:h-16 object-contain hover:scale-110 hover:-rotate-2 transition-all duration-300 cursor-pointer hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
          </div>

          {/* Round, Submit & Timer Section */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Submit Button in Header */}
            <button
              onClick={() => {
                setStopThreatAnim(true);
                setShowSubmitConfirm(true);
              }}
              disabled={isSubmitted || roundEnded}
              className={`px-4 py-2 rounded-xl font-bold text-sm md:text-base shadow-xl transition-all duration-300 z-20 border
              ${isSubmitted || roundEnded 
                ? (isLightMode ? "bg-slate-200 border-slate-300 cursor-not-allowed text-slate-400" : "bg-white/5 backdrop-blur-md border-white/10 cursor-not-allowed text-white/30") 
                : (isLightMode ? "bg-emerald-600 border-emerald-500 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95" : "bg-emerald-500 border-emerald-400 hover:bg-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95")}`}
            >
              {isSubmitted ? "Submitted" : "Submit"}
            </button>

            {activeRoundNumber != null && (
              <div className={`font-bold lg:text-lg md:text-md backdrop-blur-xl border lg:rounded-2xl md:rounded-xl px-4 py-2 shadow-2xl z-20 tracking-wide transition-colors duration-1000 ${isLightMode ? 'bg-white/60 text-slate-800 border-slate-300' : 'bg-white/10 text-white border-white/20'}`}>
                Round {activeRoundNumber}
              </div>
            )}

            {/* Round Timer */}
            <div className={`border lg:rounded-2xl md:rounded-xl shadow-2xl z-20 transition-all duration-300 ${
                  remainingSeconds != null && remainingSeconds <= 10
                    ? "bg-red-500/20 border-red-500/50 backdrop-blur-xl shadow-[0_0_20px_rgba(255,0,0,0.3)]"
                    : (isLightMode ? "bg-white/60 border-slate-300 backdrop-blur-xl" : "bg-white/10 border-white/20 backdrop-blur-xl")
                }`}>
              <div
                className={`px-4 py-2 font-mono font-bold lg:text-lg md:text-lg rounded-xl tracking-widest transition-colors ${
                  remainingSeconds != null && remainingSeconds <= 10
                    ? "text-red-400 animate-pulse"
                    : (isLightMode ? "text-slate-800" : "text-amber-400")
                }`}
              >
                {formatTime(remainingSeconds)}
              </div>
            </div>
          </div>

        </div>

        <div className="mb-2 mt-0 px-4 flex flex-col items-center">
          <div className={`backdrop-blur-xl border rounded-2xl shadow-2xl p-2 md:p-3 max-w-lg w-full text-center relative overflow-hidden group transition-colors duration-1000 ${isLightMode ? 'bg-white/60 border-slate-300' : 'bg-white/10 border-white/20'}`}>
            {/* Animated accent border */}
            <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r opacity-30 ${isLightMode ? 'from-transparent via-slate-400 to-transparent' : 'from-transparent via-yellow-400 to-transparent'}`} />
            
            <h3 className={`font-bold text-xs uppercase tracking-[0.2em] mb-1.5 drop-shadow-md transition-colors ${isLightMode ? 'text-slate-500' : 'text-yellow-400'}`}>
              Target Scenario
            </h3>
            <p className={`font-bold text-sm md:text-base lg:text-lg leading-relaxed drop-shadow-sm transition-colors ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
              <span className={!stopThreatAnim ? "threat-zoom" : ""}>
                {activeThreat?.description ?? "Waiting for threat…"}
              </span>
            </p>
          </div>
        </div>


          <div className={`mt-[-50px] md:mt-[-60px] ${boardLocked ? "pointer-events-none opacity-60" : ""}`}>
            <CircularDropContainers
              droppedCards={droppedCards}
              setDroppedCards={setDroppedCards}
              onOpenContainer={setOpenContainer}
              locked={isSubmitted}
              onCardPlaced={placeCardBackend}
              showToast={(msg, type) => {}} // This should be handled by a proper toast system if needed
              centerElement={
                <img
                  src={Board}
                  alt="Board"
                  className="w-full max-w-[50px] sm:max-w-[70px] md:max-w-[90px] lg:max-w-[110px] opacity-80 animate-breath"
                />
              }
            />

            {/* Drawer Handle */}
            {!isCardPanelOpen && (
              <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[60]">
                <button
                  onClick={() => setIsCardPanelOpen(true)}
                  className={`group flex flex-col items-center justify-center px-12 py-3 md:px-20 md:py-4
                          backdrop-blur-2xl border border-b-0 rounded-t-3xl
                          shadow-[0_-10px_40px_rgba(0,0,0,0.3)]
                          hover:-translate-y-2 transition-all duration-300 cursor-pointer
                          ${isLightMode ? 'bg-white/60 hover:bg-white/80 border-slate-300' : 'bg-white/10 hover:bg-white/20 border-white/20'}`}
                >
                  <div className={`w-16 h-1.5 rounded-full mb-2 transition-all duration-300 ${isLightMode ? 'bg-slate-300 group-hover:bg-emerald-500 group-hover:shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/40 group-hover:bg-yellow-400 group-hover:shadow-[0_0_10px_rgba(250,204,21,0.5)]'}`} />
                  <span className={`font-bold text-xs md:text-sm tracking-[0.2em] uppercase opacity-80 group-hover:opacity-100 transition-opacity ${isLightMode ? 'text-slate-600' : 'text-white'}`}>
                    Your Cards
                  </span>
                </button>
              </div>
            )}
          </div>






        {/* Blocker Modal */}
        {showBlocker && (
          <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300 ${isLightMode ? 'bg-slate-100/60 backdrop-blur-sm' : 'bg-slate-950/80'}`}>
            <div className={`backdrop-blur-2xl border rounded-3xl p-8 md:p-10 shadow-2xl text-center w-full max-w-md relative overflow-hidden transition-colors duration-1000 ${isLightMode ? 'bg-white/70 border-white/60' : 'bg-slate-900/60 border-white/10'}`}>
              <div className="relative z-10">

                {roundEnded ? (
                  <>
                    <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
                      <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <h2 className={`text-2xl md:text-3xl font-bold mb-3 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>Round Complete!</h2>
                    <p className={`mb-8 text-sm md:text-base leading-relaxed ${isLightMode ? 'text-slate-500' : 'text-white/50'}`}>
                      Time's up! The round has ended. Check the leaderboard to see how your team performed.
                    </p>
                    <button
                      onClick={() => {
                        setShowBlocker(false);
                        celebrateAndShowLeaderboard();
                      }}
                      className={`w-full py-4 rounded-xl font-bold text-base shadow-lg transition-all duration-200 active:scale-95 ${isLightMode ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-amber-500 hover:bg-amber-400 text-white'}`}
                    >
                      VIEW LEADERBOARD
                    </button>
                  </>
                ) : (
                  <>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border ${isLightMode ? 'bg-white/50 border-slate-300' : 'bg-white/5 border-white/10'}`}>
                      {hasStartedRound ? (
                        <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>

                    <h2 className={`text-2xl md:text-3xl font-bold mb-3 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                      {isSubmitted 
                        ? "Mission Accomplished"
                        : activeRoundId 
                          ? (hasStartedRound ? "Resume Round" : "Round is Active")
                          : "Ready to Play?"}
                    </h2>

                    <p className={`mb-8 text-sm md:text-base leading-relaxed ${isLightMode ? 'text-slate-500' : 'text-white/50'}`}>
                      {isSubmitted
                        ? "Your team has already submitted answers for this round. You can review your board while waiting for the round to end."
                        : activeRoundId
                          ? (hasStartedRound 
                              ? "You were already in the mission. The clock is still running!" 
                              : "The round has already started. Click Start Mission to join in!")
                          : "Stand by. The moderator will begin shortly."}
                    </p>

                    <button
                      disabled={!activeRoundId}
                      onClick={() => {
                        setShowBlocker(false);
                        if (!isSubmitted) {
                          setBoardLocked(false);
                        }
                        if (activeRoundId && group) {
                          const started = JSON.parse(localStorage.getItem("startedRounds") || "[]");
                          const roundKey = `${group.group_id}_${activeRoundId}`;
                          if (!started.includes(roundKey)) {
                            localStorage.setItem("startedRounds", JSON.stringify([...started, roundKey]));
                          }
                        }
                      }}
                      className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-200
                      ${!activeRoundId
                        ? (isLightMode ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-white/5 text-white/20 cursor-not-allowed")
                        : (isLightMode ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg active:scale-95" : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg active:scale-95")}`}
                    >
                      {isSubmitted ? "REVIEW BOARD" : (hasStartedRound ? "RESUME MISSION" : "START MISSION")}
                    </button>

                    {hasStartedRound && (
                      <p className={`mt-4 text-xs font-bold uppercase tracking-widest animate-pulse ${isLightMode ? 'text-amber-600' : 'text-amber-500/80'}`}>
                        Timer is still active
                      </p>
                    )}
                  </>
                )}

              </div>
            </div>
          </div>
        )}

        {showSubmitConfirm && (
          <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300 ${isLightMode ? 'bg-slate-100/60 backdrop-blur-sm' : 'bg-slate-950/80'}`}>
            <div className={`backdrop-blur-2xl border rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl text-center relative overflow-hidden transition-colors duration-1000 ${isLightMode ? 'bg-white/70 border-white/60' : 'bg-slate-900/60 border-white/10'}`}>
              <h2 className={`text-left text-xl md:text-2xl font-bold mb-3 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                Submit your answers?
              </h2>

              <p className={`text-left mb-6 text-sm md:text-base leading-relaxed ${isLightMode ? 'text-slate-500' : 'text-white/60'}`}>
                Once submitted, you won't be able to add or remove cards.
              </p>

              <div className="flex gap-3 md:gap-4 relative z-10">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm md:text-base transition-all duration-200
                          ${isLightMode ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                >
                  Cancel
                </button>

                <button
                  onClick={submitAnswers}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm md:text-base shadow-lg transition-all duration-200 active:scale-95
                          ${isLightMode ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-emerald-500 hover:bg-emerald-400 text-white'}`}
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
            onRemoveCard={async (cardId) => {
              if (isSubmitted) return;

              // Remove from local state
              setDroppedCards((prev) => ({
                ...prev,
                [openContainer.id]: prev[openContainer.id].filter(
                  (c) => c.card_id !== cardId,
                ),
              }));

              // Sync with backend
              try {
                await fetch(apiUrl("/round-card-selection/unplace"), {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    round_id: activeRoundId,
                    group_id: group.group_id,
                    card_id: cardId,
                  }),
                });
              } catch (err) {
                console.error("Failed to unplace card on backend", err);
              }

              // Notify drawer to show it again
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
