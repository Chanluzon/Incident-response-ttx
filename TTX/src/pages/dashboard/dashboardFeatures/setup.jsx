import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../../config/api";
import { useTheme } from "../../../context/ThemeContext";
import PageBackground from "../../../components/PageBackground";

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
        className={`relative z-10 w-full h-full flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm transition-colors duration-1000 ${isLightMode ? 'bg-white/30' : 'bg-white/10'}`}
      >
        <div className={`relative backdrop-blur-2xl border rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] w-[700px] max-w-[95%] max-h-[95%] overflow-y-auto hide-scrollbar p-6 sm:p-8 flex flex-col transition-colors duration-1000 ${isLightMode ? 'bg-white/60 border-white/40' : 'bg-slate-900/60 border-white/10'}`}>
          {/* Header */}
          <div className="text-center pt-1 sm:pt-2 pb-4 sm:pb-6">
            <h1 className={`text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br tracking-tight drop-shadow-sm mb-2 transition-colors duration-1000 ${isLightMode ? 'from-slate-800 to-slate-500' : 'from-white to-white/70'}`}>
              Welcome to TTX
            </h1>
            <h2 className={`text-lg sm:text-xl font-medium tracking-wide transition-colors duration-1000 ${isLightMode ? 'text-slate-500' : 'text-white/50'}`}>
              Register your group to begin the adventure
            </h2>
          </div>

          <div className="flex-1 flex flex-col gap-4 sm:gap-6">
            {/* Group Name */}
            <div className="text-left relative group">
              <label className={`block text-xs sm:text-sm font-bold mb-1 sm:mb-2 uppercase tracking-widest pl-1 transition-colors group-focus-within:text-blue-500 duration-1000 ${isLightMode ? 'text-slate-600' : 'text-white/80'}`}>
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className={`border-2 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-400/20 rounded-2xl px-5 w-full h-12 sm:h-14 text-base sm:text-lg font-medium transition-all shadow-inner ${isLightMode ? 'bg-white/50 border-slate-300 text-slate-800 placeholder-slate-400' : 'bg-white/5 border-white/10 text-white placeholder-white/30'}`}
                placeholder="Enter Group Name"
              />
            </div>

            {/* Group Leader */}
            <div className="text-left relative group">
              <label className={`block text-xs sm:text-sm font-bold mb-1 sm:mb-2 uppercase tracking-widest pl-1 transition-colors group-focus-within:text-blue-500 duration-1000 ${isLightMode ? 'text-slate-600' : 'text-white/80'}`}>
                Group Leader
              </label>
              <input
                type="text"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                className={`border-2 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-400/20 rounded-2xl px-5 w-full h-12 sm:h-14 text-base sm:text-lg font-medium transition-all shadow-inner ${isLightMode ? 'bg-white/50 border-slate-300 text-slate-800 placeholder-slate-400' : 'bg-white/5 border-white/10 text-white placeholder-white/30'}`}
                placeholder="Who's your Group Leader?"
              />
            </div>
          </div>

          {/* Footer Area */}
          <div className={`mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 pt-4 sm:pt-6 border-t transition-colors duration-1000 ${isLightMode ? 'border-slate-300' : 'border-white/10'}`}>
            {/* Requirements */}
            <div className="text-left">
              <ul className={`list-disc pl-5 text-sm sm:text-base space-y-1 font-medium transition-colors duration-1000 ${isLightMode ? 'text-slate-500' : 'text-white/40'}`}>
                <li>Group Name is required</li>
                <li>One player must be group leader</li>
              </ul>
            </div>

            {/* Next Button */}
            <button
              onClick={enterGame}
              disabled={!groupName.trim() || !leaderName.trim() || loading}
              className={`rounded-2xl px-8 py-3 sm:px-10 sm:py-4
                text-lg sm:text-xl font-bold flex items-center justify-center transition-all duration-300
                focus:outline-none
                ${
                  !groupName.trim() || !leaderName.trim() || loading
                    ? (isLightMode ? "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed" : "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed")
                    : (isLightMode ? "bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:-translate-y-1 active:scale-95" : "bg-blue-500 hover:bg-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:-translate-y-1 active:scale-95")
                }`}
            >
              {loading ? "Creating..." : "Next Step"}
            </button>
          </div>
        </div>
      </div>
    </PageBackground>
  );
}

