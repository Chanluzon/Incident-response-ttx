import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { apiUrl } from "../../../config/api";
import { useTheme } from "../../../context/ThemeContext";
import PageBackground from "../../../components/PageBackground";
import LiquidButton from "../../../components/LiquidButton";

export default function SetUp() {
  const navigate = useNavigate();
  const { isLightMode } = useTheme();

  const [groupName, setGroupName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [loading, setLoading] = useState(false);

  const enterGame = async () => {
    if (!groupName.trim() || !leaderName.trim()) return;

    try {
      setLoading(true);

      const res = await fetch(apiUrl("/group"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_name: groupName,
          leader_name: leaderName,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create group");
      }

      const createdGroup = await res.json();
      localStorage.setItem("currentGroup", JSON.stringify(createdGroup));

      navigate("/Dashboard");
    } catch (err) {
      console.error("Error creating group:", err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageBackground>
      <div
        className="relative z-10 w-full h-full flex items-center justify-center p-2 sm:p-4"
      >
        <div className={`relative backdrop-blur-3xl border rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.4)] w-[700px] max-w-[95%] max-h-[95%] overflow-y-auto hide-scrollbar p-8 sm:p-12 flex flex-col transition-all duration-700 ${isLightMode ? 'bg-white/70 border-white/60 shadow-blue-500/10' : 'bg-slate-900/40 border-white/10 shadow-black/50'}`}>
          {/* Decorative Liquid Glow Inner */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
          
          {/* Header */}
          <div className="text-center pt-2 pb-6 sm:pb-8">
            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br tracking-tight drop-shadow-sm mb-3 transition-colors duration-1000 ${isLightMode ? 'from-slate-800 to-slate-500' : 'from-white to-white/70'}`}>
              Welcome to TTX
            </h1>
            <h2 className={`text-lg sm:text-xl font-medium tracking-wide transition-colors duration-1000 ${isLightMode ? 'text-slate-500' : 'text-white/50'}`}>
              Register your group to begin the adventure
            </h2>
          </div>

          <div className="flex-1 flex flex-col gap-6 sm:gap-8">
            {/* Group Name */}
            <div className="text-left relative group">
              <label className={`block text-xs sm:text-sm font-bold mb-2 uppercase tracking-[0.2em] pl-1 transition-colors group-focus-within:text-blue-500 duration-1000 ${isLightMode ? 'text-slate-600' : 'text-white/70'}`}>
                Group Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className={`border-2 focus:border-blue-400 focus:outline-none focus:ring-8 focus:ring-blue-400/10 rounded-2xl px-6 w-full h-14 sm:h-16 text-lg font-semibold transition-all shadow-inner ${isLightMode ? 'bg-white/50 border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-white/5 border-white/10 text-white placeholder-white/20'}`}
                  placeholder="Enter Group Name"
                />
                <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-blue-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-center" />
              </div>
            </div>

            {/* Group Leader */}
            <div className="text-left relative group">
              <label className={`block text-xs sm:text-sm font-bold mb-2 uppercase tracking-[0.2em] pl-1 transition-colors group-focus-within:text-blue-500 duration-1000 ${isLightMode ? 'text-slate-600' : 'text-white/70'}`}>
                Group Leader
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  className={`border-2 focus:border-blue-400 focus:outline-none focus:ring-8 focus:ring-blue-400/10 rounded-2xl px-6 w-full h-14 sm:h-16 text-lg font-semibold transition-all shadow-inner ${isLightMode ? 'bg-white/50 border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-white/5 border-white/10 text-white placeholder-white/20'}`}
                  placeholder="Who's your Group Leader?"
                />
                <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-blue-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-center" />
              </div>
            </div>
          </div>

          {/* Footer Area */}
          <div className={`mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 pt-6 sm:pt-8 border-t transition-colors duration-1000 ${isLightMode ? 'border-slate-200' : 'border-white/10'}`}>
            {/* Requirements */}
            <div className="text-left">
              <ul className={`list-none space-y-2 text-sm sm:text-base font-medium transition-colors duration-1000 ${isLightMode ? 'text-slate-500' : 'text-white/40'}`}>
                <li className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${groupName.trim() ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-400'}`} />
                  Group Name is required
                </li>
                <li className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${leaderName.trim() ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-400'}`} />
                  One player must be group leader
                </li>
              </ul>
            </div>

            <LiquidButton 
              onClick={enterGame}
              disabled={!groupName.trim() || !leaderName.trim() || loading}
              label={loading ? "Creating..." : "Next Step"}
              className="w-full sm:w-[260px] h-[45px] sm:h-[48px] text-xs sm:text-sm tracking-[0.2em]"
            />
          </div>
        </div>
      </div>
    </PageBackground>
  );
}

