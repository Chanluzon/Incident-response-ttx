import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../../config/api";
import { useTheme } from "../../../context/ThemeContext";

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
    <div className={`relative w-screen h-screen overflow-hidden transition-colors duration-1000 ${isLightMode ? 'bg-slate-50' : 'bg-slate-950'}`}>
      {/* Background to match startgame */}
      <div className={`absolute inset-0 z-0 transition-all duration-1000 bg-gradient-to-br ${isLightMode ? 'from-slate-100 via-blue-50 to-slate-200' : 'from-slate-900 via-blue-900 to-indigo-950'}`} />
      
      {/* Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden z-0 opacity-40 pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-float transition-colors duration-1000 ${isLightMode ? 'bg-blue-300/40' : 'bg-blue-600/30'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] animate-morph transition-colors duration-1000 ${isLightMode ? 'bg-indigo-300/30' : 'bg-indigo-600/20'}`} />
        <div className={`absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full blur-[100px] animate-float [animation-delay:2s] transition-colors duration-1000 ${isLightMode ? 'bg-cyan-300/20' : 'bg-cyan-600/20'}`} />
      </div>

      {/* Foreground */}
      <div
        className={`relative z-10 w-full h-full flex items-center justify-center p-4 backdrop-blur-sm transition-colors duration-1000 ${isLightMode ? 'bg-white/30' : 'bg-white/10'}`}
      >
        <div className={`relative backdrop-blur-2xl border rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] w-[700px] max-w-[95%] min-h-[550px] p-8 sm:p-10 flex flex-col transition-colors duration-1000 ${isLightMode ? 'bg-white/60 border-white/40' : 'bg-slate-900/60 border-white/10'}`}>
          {/* Header */}
          <div className="text-center pt-2 sm:pt-4 pb-8">
            <h1 className={`text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br tracking-tight drop-shadow-sm mb-2 transition-colors duration-1000 ${isLightMode ? 'from-slate-800 to-slate-500' : 'from-white to-white/70'}`}>
              Welcome to TTX
            </h1>
            <h2 className={`text-lg sm:text-xl font-medium tracking-wide transition-colors duration-1000 ${isLightMode ? 'text-slate-500' : 'text-white/50'}`}>
              Register your group to begin the adventure
            </h2>
          </div>

          <div className="flex-1 flex flex-col gap-6 sm:gap-8">
            {/* Group Name */}
            <div className="text-left relative group">
              <label className={`block text-sm sm:text-base font-bold mb-2 uppercase tracking-widest pl-1 transition-colors group-focus-within:text-emerald-500 duration-1000 ${isLightMode ? 'text-slate-600' : 'text-white/80'}`}>
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className={`border-2 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 rounded-2xl px-5 w-full h-14 text-lg font-medium transition-all shadow-inner ${isLightMode ? 'bg-white/50 border-slate-300 text-slate-800 placeholder-slate-400' : 'bg-white/5 border-white/10 text-white placeholder-white/30'}`}
                placeholder="Enter Group Name"
              />
            </div>

            {/* Group Leader */}
            <div className="text-left relative group">
              <label className={`block text-sm sm:text-base font-bold mb-2 uppercase tracking-widest pl-1 transition-colors group-focus-within:text-emerald-500 duration-1000 ${isLightMode ? 'text-slate-600' : 'text-white/80'}`}>
                Group Leader
              </label>
              <input
                type="text"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                className={`border-2 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 rounded-2xl px-5 w-full h-14 text-lg font-medium transition-all shadow-inner ${isLightMode ? 'bg-white/50 border-slate-300 text-slate-800 placeholder-slate-400' : 'bg-white/5 border-white/10 text-white placeholder-white/30'}`}
                placeholder="Who's your Group Leader?"
              />
            </div>
          </div>

          {/* Footer Area */}
          <div className={`mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t transition-colors duration-1000 ${isLightMode ? 'border-slate-300' : 'border-white/10'}`}>
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
              className={`rounded-2xl px-10 py-4
                text-lg sm:text-xl font-bold flex items-center justify-center transition-all duration-300
                focus:outline-none
                ${
                  !groupName.trim() || !leaderName.trim() || loading
                    ? (isLightMode ? "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed" : "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed")
                    : (isLightMode ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-1 active:scale-95" : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-1 active:scale-95")
                }`}
            >
              {loading ? "Creating..." : "Next Step"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
