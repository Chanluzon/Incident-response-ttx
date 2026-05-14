import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, X, Maximize2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useTheme } from "../../../context/ThemeContext";
import PageBackground from "../../../components/PageBackground";
import LiquidButton from "../../../components/LiquidButton";
import FormattedDescription from "../../../components/FormattedDescription";

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
  const [showFullScenario, setShowFullScenario] = useState(false);
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
    <PageBackground>
      <div className={`relative z-10 min-h-screen transition-colors duration-1000 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
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
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 px-6 md:px-10 pt-4 pb-4">
          {/* Logo Section */}
          <div className="flex items-center">
            <img 
              src={WorldtechLogo} 
              alt="Worldtech" 
              className={`h-10 md:h-14 lg:h-20 object-contain hover:scale-110 hover:-rotate-2 transition-all duration-500 cursor-pointer ${isLightMode ? 'logo-glow-light' : 'logo-glow'} hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]`} 
            />

          </div>

          {/* Round, Submit & Timer Section */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Submit Button in Header */}
            <div className="relative group">
              <LiquidButton
                onClick={() => {
                  setStopThreatAnim(true);
                  setShowSubmitConfirm(true);
                }}
                disabled={isSubmitted || boardLocked}
                label={isSubmitted ? "SUBMITTED" : "SUBMIT"}
                className="w-auto px-6 md:px-10 h-12 md:h-14 text-sm md:text-base"
                showArrow={false}
                showPulse={false}
              />
            </div>

            {activeRoundNumber != null && (
              <div className={`font-black lg:text-xl md:text-lg backdrop-blur-3xl border-2 lg:rounded-[1.5rem] md:rounded-2xl px-6 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-20 tracking-[0.2em] uppercase transition-all duration-1000 ${isLightMode ? 'bg-white/70 text-slate-800 border-white/60' : 'bg-white/5 text-white border-white/10'}`}>
                RD {activeRoundNumber}
              </div>
            )}

            {/* Round Timer */}
            <div className={`border-2 lg:rounded-[1.5rem] md:rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] z-20 transition-all duration-500 ${remainingSeconds != null && remainingSeconds <= 10
              ? "bg-red-500/20 border-red-500/50 backdrop-blur-3xl shadow-[0_0_30px_rgba(255,0,0,0.4)]"
              : (isLightMode ? "bg-white/70 border-white/60 backdrop-blur-3xl" : "bg-white/10 border-white/10 backdrop-blur-3xl")
              }`}>
              <div
                className={`px-6 py-3 font-mono font-black lg:text-xl md:text-xl rounded-xl tracking-[0.2em] transition-colors ${remainingSeconds != null && remainingSeconds <= 10
                  ? "text-red-400 animate-pulse"
                  : (isLightMode ? "text-slate-800" : "text-amber-400")
                  }`}
              >
                {formatTime(remainingSeconds)}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 mt-[-40px] px-4 flex flex-col items-center relative z-20">
          <div
            onClick={() => setShowFullScenario(true)}
            className={`backdrop-blur-3xl border-2 rounded-[2rem] shadow-[0_20px_60px_rgba(239,68,68,0.2)] px-6 py-3 w-[300px] h-[100px] flex flex-col justify-center items-center text-center relative overflow-hidden group transition-all duration-700 cursor-pointer hover:scale-[1.03] active:scale-[0.97] ${isLightMode ? 'bg-red-50/90 border-red-200 hover:bg-red-100/95' : 'bg-red-500/10 border-red-500/40 hover:bg-red-500/20'}`}>

            {/* Liquid Glow Accent */}
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${isLightMode ? 'from-transparent via-red-400/40 to-transparent' : 'from-transparent via-red-400/40 to-transparent'} opacity-50`} />

            <h3 className={`font-black text-xs uppercase tracking-[0.4em] mb-2 transition-colors ${isLightMode ? 'text-red-600' : 'text-red-400'}`}>
              Target Scenario
            </h3>

            <p
              className={`font-black text-base md:text-lg leading-relaxed tracking-tight transition-colors ${isLightMode ? 'text-slate-800' : 'text-white'}`}
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {activeThreat?.description ?? "Waiting for mission parameters..."}
            </p>

            {/* Tap to expand hint */}
            <div className="mt-2 text-[10px] font-bold tracking-[0.2em] uppercase opacity-0 group-hover:opacity-40 transition-opacity flex items-center justify-center gap-2">
              <div className="w-1 h-1 rounded-full bg-current animate-ping" />
              Click to enlarge
            </div>
          </div>
        </div>


        <div className={`mt-[-60px] md:mt-[-80px] ${boardLocked ? "pointer-events-none opacity-60" : ""}`}>
          <CircularDropContainers
            droppedCards={droppedCards}
            setDroppedCards={setDroppedCards}
            onOpenContainer={setOpenContainer}
            locked={isSubmitted}
            onCardPlaced={placeCardBackend}
            showToast={(msg, type) => { }} // This should be handled by a proper toast system if needed
            centerElement={
              <div className="relative group">
                {/* Liquid background glow for the center lock */}
                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-150 animate-pulse-slow" />
                <img
                  src={Board}
                  alt="Board"
                  className="relative z-10 w-full max-w-[60px] sm:max-w-[80px] md:max-w-[100px] lg:max-w-[130px] opacity-90 animate-breath"
                />
              </div>
            }
          />

          {/* Drawer Handle */}
          {!isCardPanelOpen && (
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[60]">
              <button
                onClick={() => setIsCardPanelOpen(true)}
                className={`group flex flex-col items-center justify-center px-10 py-3 sm:px-14 sm:py-4 md:px-16 md:py-5 lg:px-20 lg:py-6
                          backdrop-blur-[40px] border-2 border-b-0 rounded-t-[3rem]
                          shadow-[0_-20px_60px_rgba(0,0,0,0.4)]
                          hover:-translate-y-3 transition-all duration-700 cursor-pointer
                          ${isLightMode ? 'bg-white/80 hover:bg-white border-white/60' : 'bg-slate-900/40 hover:bg-slate-900/60 border-white/10'}`}
              >
                {/* Moving indicator */}
                <div className={`w-20 h-1.5 rounded-full mb-3 transition-all duration-700 overflow-hidden relative ${isLightMode ? 'bg-slate-200' : 'bg-white/10'}`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent translate-x-[-100%] animate-shimmer" />
                </div>
                <span className={`font-black text-xs md:text-sm tracking-[0.4em] uppercase opacity-70 group-hover:opacity-100 transition-opacity ${isLightMode ? 'text-slate-600' : 'text-white'}`}>
                  Your E-Cards
                </span>
              </button>
            </div>
          )}
        </div>


        {/* Blocker Modal */}
        {showBlocker && (
          <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-700 ${isLightMode ? 'bg-slate-100/60 backdrop-blur-md' : 'bg-slate-950/90'}`}>
            <div className={`backdrop-blur-[50px] border-2 rounded-[3.5rem] p-10 md:p-14 shadow-[0_50px_120px_rgba(0,0,0,0.6)] text-center w-full max-w-lg relative overflow-hidden transition-all duration-1000 ${isLightMode ? 'bg-white/90 border-white/80 shadow-blue-500/10' : 'bg-slate-900/60 border-white/10'}`}>

              {/* Liquid Glow Inner */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

              <div className="relative z-10">

                {roundEnded ? (
                  <>
                    <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border-2 border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
                      <Trophy size={40} className="text-amber-400" />
                    </div>
                    <h2 className={`text-3xl md:text-4xl font-black mb-4 tracking-tighter ${isLightMode ? 'text-slate-800' : 'text-white'}`}>ROUND COMPLETE</h2>
                    <p className={`mb-10 text-base md:text-lg font-medium leading-relaxed tracking-tight ${isLightMode ? 'text-slate-500' : 'text-white/50'}`}>
                      Review your strategic performance on the leaderboard.
                    </p>
                    <button
                      onClick={() => {
                        setShowBlocker(false);
                        celebrateAndShowLeaderboard();
                      }}
                      className={`group relative overflow-hidden w-full py-5 rounded-2xl font-black text-lg tracking-[0.2em] uppercase shadow-2xl transition-all duration-500 active:scale-95 border-2 ${isLightMode ? 'bg-amber-500 border-white/20 hover:bg-amber-400 text-white' : 'bg-amber-600 border-white/10 hover:bg-amber-500 text-white'}`}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        <Trophy size={24} />
                        View Leaderboard
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 border-2 shadow-2xl ${isLightMode ? 'bg-white/80 border-white shadow-blue-500/5' : 'bg-white/5 border-white/10 shadow-black/50'}`}>
                      {hasStartedRound ? (
                        <div className="relative">
                          <div className="absolute inset-0 bg-amber-500/50 blur-xl animate-pulse" />
                          <svg className="w-10 h-10 text-amber-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="absolute inset-0 bg-blue-500/50 blur-xl animate-pulse" />
                          <svg className="w-10 h-10 text-blue-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <h2 className={`text-3xl md:text-4xl font-black mb-4 tracking-tighter ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                      {isSubmitted
                        ? "Mission Accomplished"
                        : activeRoundId
                          ? (hasStartedRound ? "Resume Round" : "Round is Active")
                          : "Ready to Play?"}
                    </h2>

                    <p className={`mb-10 text-base md:text-lg font-medium leading-relaxed tracking-tight ${isLightMode ? 'text-slate-500' : 'text-white/50'}`}>
                      {isSubmitted
                        ? "Your team has already submitted answers for this round. You can review your board while waiting for the round to end."
                        : activeRoundId
                          ? (hasStartedRound
                            ? "You were already in the round. The clock is still running!"
                            : "The round has already started. Click Start Mission to join in!")
                          : "Stand by. The moderator will begin shortly."}
                    </p>

                    <LiquidButton
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
                      label={isSubmitted ? "REVIEW BOARD" : (hasStartedRound ? "RESUME" : "START MISSION")}
                      className="w-full"
                    />

                    {hasStartedRound && (
                      <div className="mt-6 flex items-center justify-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        <span className={`text-xs font-black uppercase tracking-[0.3em] ${isLightMode ? 'text-amber-600' : 'text-amber-400'}`}>
                          Timer is still active
                        </span>
                      </div>
                    )}
                  </>
                )}

              </div>
            </div>
          </div>
        )}

        {showSubmitConfirm && (
          <div className={`fixed inset-0 z-[300] flex items-center justify-center p-4 animate-in fade-in duration-500 ${isLightMode ? 'bg-slate-100/70 backdrop-blur-md' : 'bg-slate-950/90'}`}>
            <div className={`backdrop-blur-[40px] border-2 rounded-[3rem] p-8 md:p-12 w-full max-w-[480px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] text-center relative overflow-hidden transition-all duration-1000 ${isLightMode ? 'bg-white/90 border-white/80' : 'bg-slate-900/80 border-white/10'}`}>

              {/* Liquid Glow Inner */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

              <h2 className={`text-left text-2xl md:text-3xl font-black mb-4 tracking-tighter ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                Submit your answers?
              </h2>

              <p className={`text-left mb-10 text-base md:text-lg font-medium leading-relaxed tracking-tight ${isLightMode ? 'text-slate-500' : 'text-white/60'}`}>
                Once submitted, you won't be able to add or remove cards.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                <LiquidButton
                  onClick={() => setShowSubmitConfirm(false)}
                  label="Cancel"
                  variant="secondary"
                  className="flex-1 w-full sm:w-auto h-14 md:h-16"
                  showArrow={false}
                  showPulse={false}
                />

                <LiquidButton
                  onClick={submitAnswers}
                  label="Submit"
                  className="flex-1 w-full sm:w-auto h-14 md:h-16"
                  showArrow={false}
                  showPulse={false}
                />
              </div>
            </div>
          </div>
        )}

        {showFullScenario && (
          <div className={`fixed inset-0 z-[400] flex items-center justify-center p-4 animate-in fade-in duration-500 ${isLightMode ? 'bg-slate-100/70 backdrop-blur-md' : 'bg-slate-950/90'}`}>
            <div className={`backdrop-blur-[50px] border-2 rounded-[3rem] p-10 shadow-[0_50px_120px_rgba(0,0,0,0.6)] text-center w-full max-w-4xl relative overflow-hidden transition-all duration-700 ${isLightMode ? 'bg-white/95 border-white/80' : 'bg-slate-900/90 border-white/10'}`}>



              <div className={`relative z-10 w-full ${activeThreat?.description?.length < 120 ? 'text-center' : 'text-left'}`}>
                <h3 className={`font-black text-xs uppercase tracking-[0.6em] mb-8 transition-colors ${isLightMode ? 'text-slate-400' : 'text-amber-400/60'} ${activeThreat?.description?.length < 120 ? 'text-center' : 'text-left'}`}>
                  TARGET SCENARIO
                </h3>

                <div className={`p-8 rounded-[2rem] mb-10 transition-all duration-500 shadow-inner h-[450px] overflow-y-auto custom-scrollbar ${isLightMode ? 'bg-slate-50 border-2 border-slate-100' : 'bg-white/5 border-2 border-white/10'}`}>
                  <p className={`text-xl md:text-2xl font-black leading-relaxed tracking-tight break-all transition-colors ${isLightMode ? 'text-slate-800' : 'text-white'} ${activeThreat?.description?.length < 120 ? 'text-center' : 'text-left'}`}>
                    <FormattedDescription
                      description={activeThreat?.description ?? "Awaiting mission data injection..."}
                    />
                  </p>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => setShowFullScenario(false)}
                    className={`px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all duration-500 active:scale-95 border-2 ${isLightMode ? 'bg-slate-900 border-white/10 text-white hover:bg-slate-800' : 'bg-white border-white text-slate-900 hover:bg-slate-100'}`}
                  >
                    RETURN
                  </button>
                </div>
              </div>

              {/* Liquid accent */}
              <div className={`absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r ${isLightMode ? 'from-blue-500 via-indigo-500 to-cyan-500' : 'from-blue-600 via-indigo-600 to-cyan-600'} opacity-50`} />
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
    </PageBackground>
  );
}
