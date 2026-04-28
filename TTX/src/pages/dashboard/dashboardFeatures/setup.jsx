import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BG from "../../../images/auth-background.png";
import { apiUrl } from "../../../config/api";

export default function SetUp() {
  const navigate = useNavigate();

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
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105 z-0"
        style={{ backgroundImage: `url(${BG})` }}
      />

      {/* Foreground */}
      <div
        className="relative z-10 w-full h-full flex items-center justify-center"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.45) 100%)",
        }}
      >
        <div className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-[700px] max-w-[90%] h-[600px] p-10">
          {/* Header */}
          <div className="text-center pt-5">
            <h1 className="text-4xl font-bold text-gray-800">
              Welcome to TTX Awareness!
            </h1>
            <h2 className="text-2xl font-medium text-gray-400 mt-2">
              Register your group to begin the adventure
            </h2>
          </div>

          {/* Group Name */}
          <div className="pt-12 text-left">
            <label className="block text-xl font-semibold text-gray-700 mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="border-2 border-green-400 focus:border-green-500 text-green-900
                focus:outline-none focus:ring-2 focus:ring-[#2EE58A]
                rounded-lg px-4 w-full h-12 text-lg font-medium"
              placeholder="Enter Group Name"
            />
          </div>

          {/* Group Leader */}
          <div className="pt-6 text-left">
            <label className="block text-xl font-semibold text-gray-700 mb-2">
              Group Leader
            </label>
            <input
              type="text"
              value={leaderName}
              onChange={(e) => setLeaderName(e.target.value)}
              className="border-2 border-green-400 focus:border-green-500 text-green-900
                focus:outline-none focus:ring-2 focus:ring-[#2EE58A]
                rounded-lg px-4 w-full h-12 text-lg font-medium"
              placeholder="Who's your Group Leader?"
            />
          </div>

          {/* Requirements */}
          <div className="pt-8 text-left">
            <h2 className="text-xl font-semibold text-gray-500 mb-3">
              Requirements
            </h2>
            <ul className="list-disc pl-6 text-lg text-gray-500 space-y-2">
              <li>Group Name is required</li>
              <li>One player must be group leader</li>
            </ul>
          </div>

          {/* Next Button */}
          <div className="absolute bottom-12 right-10">
            <button
              onClick={enterGame}
              disabled={!groupName.trim() || !leaderName.trim() || loading}
              className={`rounded-full w-48 h-12
                text-2xl font-semibold flex items-center justify-center transition-all
                focus:outline-none focus:ring-2 focus:ring-[#2EE58A]
                ${
                  !groupName.trim() || !leaderName.trim() || loading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[green] hover:bg-[#55AA55] text-white"
                }`}
            >
              {loading ? "Creating..." : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
