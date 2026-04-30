import React, { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Users,
  ShieldAlert,
  Settings,
  Gamepad2,
  Layers,
  Pencil,
  Save,
  Trash2,
  X,
} from "lucide-react";
import GameSettingsModal from "./gameSettingsModal";
import CreateGameModal from "./createGameModal";
import AddThreatModal from "./threatModal";
import ManageThreatsModal from "./manageThreatsModal";
import { apiUrl } from "../../../config/api";

export default function ModeratorDashboard() {
  const [stats, setStats] = useState({
    totalCards: 0,
    totalThreats: 0,
    totalTeams: 0,
    totalGames: 0,
    activeGames: 0,
    pendingGames: 0,
  });

  const CARD_TABS = [
    { label: "Prepare", value: "Safeguards / Controls" },
    { label: "Detect", value: "Vulnerabilities" },
    { label: "Respond", value: "Threat Agents" },
    { label: "Recover", value: "Risks" },
    { label: "Lessons Learned", value: "InfoSec Pillars" },
  ];

  const CATEGORY_DESCRIPTIONS = {
    safeguard:
      "Protective measures (policies, procedures, or technologies) implemented to prevent, detect, or mitigate security risks and protect assets.",
    vulnerability:
      "Weaknesses, flaws, or gaps in an information system, security procedures, internal controls, or implementation that could be exploited by a threat.",
    "threat agents":
      "Individuals, groups, or entities (internal or external) that have the potential to exploit a vulnerability and cause harm to an organization's assets.",
    risk: "The potential for loss, damage, or destruction of an asset as a result of a threat exploiting a vulnerability; often measured as Impact × Likelihood.",
    "infosec pillars":
      "The core principles of information security, commonly known as the CIA Triad: Confidentiality, Integrity, and Availability.",
  };

  const moderator = JSON.parse(localStorage.getItem("moderator"));

  const [loading, setLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showManageCards, setShowManageCards] = useState(false);
  const [showAddThreat, setShowAddThreat] = useState(false);
  const [showManageThreats, setShowManageThreats] = useState(false);
  const [categories, setCategories] = useState([]);

  const [activeTab, setActiveTab] = useState("Safeguards / Controls");
  const [cards, setCards] = useState([]);

  const getCategoryColorClass = (cat) => {
    switch (cat) {
      case "safeguard":
        return "bg-[#67C2C9]/20 text-[#4DA8AF]";
      case "vulnerability":
        return "bg-[#FDEE00]/20 text-yellow-700";
      case "threat agents":
        return "bg-[#FF9EBD]/20 text-pink-700";
      case "risk":
        return "bg-[#32CD32]/20 text-green-700";
      case "infosec pillars":
        return "bg-[#FFB347]/20 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };
  const [teams, setTeams] = useState([]);
  const INFOSEC_LIMIT = 3;

  const infosecCount = cards.filter(
    (c) => c.category === "infosec pillars",
  ).length;

  const [showGameSettings, setShowGameSettings] = useState(false);
  const [showCreateGame, setShowCreateGame] = useState(false);

  const [recentActivity, setRecentActivity] = useState([]);
  const [toasts, setToasts] = useState([]);

  const [newCardTitle, setNewCardTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editingCard, setEditingCard] = useState(null);

  const showToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const confirmToast = (message) => {
    return new Promise((resolve) => {
      const id = Date.now();
      const newToast = {
        id,
        message,
        type: "confirm",
        onConfirm: () => {
          resolve(true);
          setToasts((prev) => prev.filter((t) => t.id !== id));
        },
        onCancel: () => {
          resolve(false);
          setToasts((prev) => prev.filter((t) => t.id !== id));
        },
      };
      setToasts((prev) => [...prev, newToast]);
    });
  };

  const toggleEdit = (id) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isEditing: !c.isEditing } : c)),
    );
  };

  const logActivity = (message, type = "info") => {
    const newEntry = {
      message,
      type,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      timestamp: Date.now(),
    };

    setRecentActivity((prev) => {
      const updated = [newEntry, ...prev.slice(0, 9)];
      localStorage.setItem("recentActivity", JSON.stringify(updated));

      return updated;
    });
  };

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("recentActivity") || "[]");
    // expires in 12 hours
    const hrs = 12;
    const cutoff = Date.now() - hrs * 60 * 60 * 1000;

    const filtered = stored.filter((item) => item.timestamp >= cutoff);

    setRecentActivity(filtered);
    localStorage.setItem("recentActivity", JSON.stringify(filtered));
  }, []);

  const handleEdit = (id, value, field) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;

        if (field === "pendingCategory") {
          return { ...c, pendingCategory: value };
        }

        if (field === "title") {
          return { ...c, title: value };
        }

        if (field === "description") {
          return { ...c, description: value };
        }

        return c;
      }),
    );
  };

  const handleSave = async (id) => {
    const cardToUpdate = cards.find((c) => c.id === id);

    try {
      const finalCategory = cardToUpdate.pendingCategory;
      if (
        cardToUpdate.pendingCategory === "infosec pillars" &&
        cardToUpdate.category !== "infosec pillars" &&
        infosecCount >= INFOSEC_LIMIT
      ) {
        showToast("Only 3 InfoSec Pillars cards are allowed.", "warning");
        return;
      }
      const res = await fetch(apiUrl(`/card/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card_name: cardToUpdate.title,
          category: finalCategory,
          description: cardToUpdate.description,
        }),
      });

      if (!res.ok) throw new Error("Failed to update card");

      const updatedCard = await res.json();

      setCards((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                title: updatedCard.card_name,
                category: updatedCard.category,
                description: updatedCard.description,
                pendingCategory: updatedCard.category,
                color:
                  updatedCard.category === "safeguard"
                    ? "bg-[#67C2C9]/20 text-[#4DA8AF]"
                    : updatedCard.category === "vulnerability"
                      ? "bg-[#FDEE00]/20 text-yellow-700"
                      : updatedCard.category === "threat agents"
                        ? "bg-[#FF9EBD]/20 text-pink-700"
                        : updatedCard.category === "risk"
                          ? "bg-[#32CD32]/20 text-green-700"
                          : updatedCard.category === "infosec pillars"
                            ? "bg-[#FFB347]/20 text-orange-700"
                            : "bg-gray-100 text-gray-700",
                isEditing: false,
              }
            : c,
        ),
      );

      showToast("Card updated successfully!");
      logActivity(
        `Edited card "${cardToUpdate.title}" (${cardToUpdate.pendingCategory})`,
        "edit",
      );
    } catch (err) {
      console.error("Error updating card:", err);
      showToast("Failed to update card.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmToast(
      "Are you sure you want to delete this card?",
    );
    if (!confirmed) return;

    try {
      const res = await fetch(apiUrl(`/card/${id}`), { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete card");

      setCards((prev) => prev.filter((c) => c.id !== id));
      setStats((prev) => ({ ...prev, totalCards: prev.totalCards - 1 }));

      showToast("Card deleted successfully!", "success");
      logActivity(`Deleted a card`, "delete");
    } catch (err) {
      console.error("Error deleting card:", err);
      showToast("Failed to delete card.", "error");
    }
  };

  const fetchCards = async () => {
    try {
      const response = await fetch(apiUrl("/card"));
      if (!response.ok) throw new Error("Failed to fetch cards");
      const data = await response.json();

      setStats((prev) => ({
        ...prev,
        totalCards: data.length,
      }));

      setCards(
        data.map((c) => ({
          id: c.card_id,
          title: c.card_name,
          category: c.category,
          description: c.description,
          pendingCategory: c.category,
          color:
            c.category === "safeguard"
              ? "bg-[#67C2C9]/20 text-[#4DA8AF]"
              : c.category === "vulnerability"
                ? "bg-[#FDEE00]/20 text-yellow-700"
                : c.category === "threat agents"
                  ? "bg-[#FF9EBD]/20 text-pink-700"
                  : c.category === "risk"
                    ? "bg-[#32CD32]/20 text-green-700"
                    : c.category === "infosec pillars"
                      ? "bg-[#FFB347]/20 text-orange-700"
                      : "bg-gray-100 text-gray-700",
          isEditing: false,
        })),
      );

      setLoading(false);
    } catch (err) {
      console.error("Error fetching cards:", err);
      setLoading(false);
    }
  };

  const fetchThreats = async () => {
    try {
      const res = await fetch(apiUrl("/threat"));
      if (!res.ok) throw new Error("Failed to fetch threats");

      const data = await res.json();

      setStats((prev) => ({
        ...prev,
        totalThreats: data.length,
      }));
    } catch (err) {
      console.error("Error fetching threats:", err);
    }
  };

  const fetchCategories = async () => {
    const res = await fetch(apiUrl("/category"));
    const data = await res.json();
    setCategories(data);
  };

  const fetchTeams = async () => {
    try {
      const res = await fetch(apiUrl("/group"));
      if (!res.ok) throw new Error("Failed to fetch groups");

      const data = await res.json();
      console.log("GROUP RESPONSE:", data);

      const groups = data.groups || data;

      setTeams(
        groups.map((group) => ({
          id: group.group_id,
          name: group.group_name,
          leader: group.leader_name,
          status: "Active",
        })),
      );

      setStats((prev) => ({
        ...prev,
        totalTeams: groups.length,
      }));
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  const [showViewTeams, setShowViewTeams] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTeams = teams.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.name.toLowerCase().includes(term) ||
      t.leader.toLowerCase().includes(term) ||
      t.status.toLowerCase().includes(term)
    );
  });

  const activeTeams = teams.filter((t) => t.status === "Active").length;

  const handleDeleteTeam = async (id) => {
    const confirmed = await confirmToast(
      "Are you sure you want to delete this team?",
    );
    if (!confirmed) return;

    const team = teams.find((t) => t.id === id);
    const teamName = team ? team.name : `Team ${id}`;

    try {
      const res = await fetch(apiUrl(`/group/${id}`), {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete team");

      setTeams((prev) => prev.filter((t) => t.id !== id));
      setStats((prev) => ({
        ...prev,
        totalTeams: prev.totalTeams - 1,
      }));

      showToast("Team deleted successfully!", "success");
      logActivity(`Deleted team "${teamName}"`, "delete");
    } catch (err) {
      console.error("Error deleting team:", err);
      showToast("Failed to delete team.", "error");
    }
  };

  const AnimatedNumber = ({ value }) => {
    const [display, setDisplay] = useState(value);
    const prevValue = React.useRef(value);

    useEffect(() => {
      if (value === prevValue.current) return;

      const start = prevValue.current;
      const end = value;
      const duration = 700;
      const stepTime = 16;
      const increment = (end - start) / (duration / stepTime);
      let current = start;

      const interval = setInterval(() => {
        current += increment;
        if (
          (increment > 0 && current >= end) ||
          (increment < 0 && current <= end)
        ) {
          current = end;
          clearInterval(interval);
        }
        setDisplay(Math.floor(current));
      }, stepTime);

      prevValue.current = value;
      return () => clearInterval(interval);
    }, [value]);

    return <>{display}</>;
  };

  const fetchGamesStats = async () => {
    try {
      const res = await fetch(apiUrl("/games"));
      if (!res.ok) throw new Error("Failed to fetch games");

      const games = await res.json();

      const active = games.filter((g) => g.status === "active").length;
      const pending = games.filter((g) => g.status === "pending").length;

      setStats((prev) => ({
        ...prev,
        activeGames: active,
        pendingGames: pending,
        totalGames: games.length,
      }));
    } catch (err) {
      console.error("Error fetching games:", err);
    }
  };

  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    showToast("Logged out successfully!", "success");

    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("moderator");
      window.location.href = "/moderator";
    }, 1800);
  };

  const tabColors = {
    "Safeguards / Controls": "border-[#67C2C9]",
    Vulnerabilities: "border-[#FDEE00]",
    "Threat Agents": "border-[#FF9EBD]",
    Risks: "border-[#32CD32]",
    "InfoSec Pillars": "border-[#FFB347]",
  };

  const categoryUnderline = {
    safeguard: "border-yellow-700",
    vulnerability: "border-blue-700",
    "threat agents": "border-orange-700",
    risk: "border-red-700",
    "infosec pillars": "border-pink-700",
  };

  const refreshDashboard = useCallback(async () => {
    await Promise.all([
      fetchCards(),
      fetchThreats(),
      fetchCategories(),
      fetchTeams(),
      fetchGamesStats(),
    ]);
  }, []);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  const clearRecentActivity = async () => {
    const confirmed = await confirmToast("Clear all recent activity?");
    if (!confirmed) return;

    setRecentActivity([]);
    localStorage.removeItem("recentActivity");

    showToast("Recent activity cleared", "success");
  };

  return (
    <div className="h-screen w-screen overflow-y-auto bg-gray-50 text-gray-900 hide-scrollbar">
      <div
        className="absolute inset-0 bg-white/10 backdrop-blur-sm"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,0.45) 200%)",
        }}
      />
      {/* Main Content */}
      <main className="relative pt-20 pb-10 px-8 min-h-screen">
        {moderator && (
          <div
            className="absolute top-5 left-5 z-50 mb-4 inline-block cursor-pointer"
            onClick={() => setShowMenu(!showMenu)}
          >
            {/* User Bubble */}
            <div className="ml-3.5 bg-white shadow-md rounded-full px-5 py-2 flex items-center gap-3 border border-gray-300">
              <div className="w-7 h-7 bg-[#3ce28a] rounded-full flex items-center justify-center text-white font-bold">
                {moderator.name ? moderator.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="text-gray-700 font-semibold">
                {moderator.name || moderator.email}
              </div>
            </div>

            {/* Logout */}
            {showMenu && (
              <div
                className="absolute left-full top-1/2 -translate-y-1/2 ml-3
                    bg-white shadow-md border border-gray-300
                    rounded-full px-3 flex items-center
                    animate-fadeIn z-50 hover:bg-red-400"
              >
                <button
                  onClick={async () => {
                    const confirmed = await confirmToast(
                      "Are you sure you want to logout?",
                    );
                    if (confirmed) handleLogout();
                  }}
                  className="text-red-600 hover:text-white font-medium transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-[70vh] text-gray-500 text-lg animate-pulse">
            Loading dashboard...
          </div>
        ) : (
          <>
            {/* Stats Section */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Total Cards */}
              <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                <div>
                  <p className="text-gray-500 text-sm">Total Cards</p>
                  <p className="text-5xl font-bold mt-1">
                    <AnimatedNumber value={stats.totalCards} />
                  </p>
                </div>
                <div className="bg-purple-100 text-purple-500 p-4 rounded-2xl">
                  <Layers size={32} />
                </div>
              </div>

              {/* Total Threats */}
              <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                <div>
                  <p className="text-gray-500 text-sm">Total Threats</p>
                  <p className="text-5xl font-bold mt-1">
                    <AnimatedNumber value={stats.totalThreats} />
                  </p>
                </div>
                <div className="bg-red-100 text-red-500 p-4 rounded-2xl">
                  <ShieldAlert size={32} />
                </div>
              </div>

              {/* Total Teams */}
              <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                <div>
                  <p className="text-gray-500 text-sm">Total Teams</p>
                  <p className="text-5xl font-bold mt-1">
                    <AnimatedNumber value={stats.totalTeams} />
                  </p>
                </div>
                <div className="bg-blue-100 text-blue-500 p-4 rounded-2xl">
                  <Users size={32} />
                </div>
              </div>

              {/* Total Games */}
              <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                <div>
                  <p className="text-gray-500 text-sm">Total Games</p>
                  <p className="text-5xl font-bold mt-1">
                    <AnimatedNumber value={stats.totalGames} />
                  </p>
                </div>
                <div className="bg-green-100 text-green-500 p-4 rounded-2xl">
                  <Gamepad2 size={34} />
                </div>
              </div>
            </section>

            {/* Management Section */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
              {/* Card Management */}
              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition text-left">
                <h2 className="text-xl font-bold text-purple-500 flex items-center gap-2">
                  <Layers size={28} /> Card Management
                </h2>
                <p className="text-gray-500 text-sm mb-4 leading-snug">
                  Create, edit, and manage your card collection.
                </p>

                <div className="flex gap-3 text-sm font-semibold">
                  <span className="bg-gray-100 px-3 py-1 rounded-full">
                    {stats.totalCards} Cards
                  </span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full">
                    5 Categories
                  </span>
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => setShowAddCard(true)}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-xs text-white py-2 rounded-full font-semibold transition flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Add Card
                  </button>
                  <button
                    onClick={() => setShowManageCards(true)}
                    className="flex-1 bg-gray-700 hover:bg-gray-800 text-white py-2 rounded-full font-semibold transition flex items-center justify-center gap-2"
                  >
                    <Settings size={16} /> Manage
                  </button>
                </div>
              </div>

              {/* Threat Management */}
              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition text-left">
                <h2 className="text-xl font-bold text-red-500 flex items-center gap-2">
                  <ShieldAlert size={28} /> Threat Management
                </h2>

                <p className="text-gray-500 text-sm mb-4 leading-snug">
                  View, create, and manage threats.
                </p>

                <div className="flex gap-3 text-sm font-semibold">
                  <span className="bg-gray-100 px-3 py-1 rounded-full">
                    {stats.totalThreats} Threats
                  </span>
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => setShowAddThreat(true)}
                    className="flex-1 bg-[#f05c74] hover:bg-[#ef2541] text-white text-xs py-2 rounded-full font-semibold transition flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Add Threat
                  </button>

                  <button
                    onClick={() => setShowManageThreats(true)}
                    className="flex-1 bg-gray-700 hover:bg-gray-800 text-white py-2 rounded-full font-semibold transition flex items-center justify-center gap-2"
                  >
                    <Settings size={16} /> Manage
                  </button>
                </div>
              </div>

              {/* Team Management */}
              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition text-left">
                <h2 className="text-xl font-bold text-blue-500 flex items-center gap-2">
                  <Users size={24} /> Team Management
                </h2>
                <p className="text-gray-500 text-sm mb-4 leading-snug">
                  View and manage registered teams.
                </p>

                <div className="flex gap-3 text-sm font-semibold">
                  <span className="bg-gray-100 px-3 py-1 rounded-full">
                    {activeTeams} Active
                  </span>
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => setShowViewTeams(true)}
                    className="w-full bg-[#0d97fb] hover:bg-[#4461ef] text-white py-2 rounded-full font-semibold transition flex items-center justify-center gap-2"
                  >
                    <Users size={16} /> View Teams
                  </button>
                </div>
              </div>

              {/* Game Management */}
              <div className="bg-green-900 rounded-2xl p-6 shadow-md hover:shadow-lg transition text-left">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Gamepad2 size={24} /> Game Management
                </h2>
                <p className="text-white text-sm mb-4 leading-snug">
                  Create, view, and manage game details.
                </p>

                <div className="flex gap-3 text-sm font-semibold">
                  <span className="bg-gray-100 px-3 py-1 rounded-full">
                    {stats.activeGames} Active
                  </span>

                  <span className="bg-gray-100 px-3 py-1 rounded-full">
                    {stats.pendingGames} Pending
                  </span>
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => setShowCreateGame(true)}
                    className="flex-1 bg-[green] hover:bg-[#55AA55] text-xs text-white py-2 rounded-full font-semibold transition flex items-center justify-center gap-2"
                  >
                    <Gamepad2 size={16} /> New Game
                  </button>

                  <button
                    onClick={() => setShowGameSettings(true)}
                    className="flex-1 bg-[#1E2939] hover:bg-gray-600 text-white py-2 rounded-full font-semibold transition flex items-center justify-center gap-2"
                  >
                    <Settings size={16} /> Settings
                  </button>
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <section className="mt-12">
              <div className="bg-white rounded-2xl p-6 text-left">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold">Recent Activity</h3>

                  {recentActivity.length > 0 && (
                    <button
                      onClick={clearRecentActivity}
                      className="px-3 py-1.5 rounded-full
                                bg-red-100 hover:bg-red-200
                                text-red-700 text-xs font-semibold
                                flex items-center gap-1 transition"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <p className="text-gray-500 text-sm mb-4">
                  Latest updates in your dashboard
                </p>

                <div className="space-y-3">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, i) => (
                      <div
                        key={i}
                        className={`bg-white rounded-xl px-5 py-3 flex justify-between items-center shadow-sm hover:shadow-md transition border-l-4 ${
                          activity.type === "success"
                            ? "border-green-400"
                            : activity.type === "edit"
                              ? "border-blue-400"
                              : activity.type === "delete"
                                ? "border-red-400"
                                : activity.type === "team"
                                  ? "border-purple-400"
                                  : "border-gray-300"
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-gray-800">
                            {activity.message}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400">{activity.time}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center mt-5">
                      No recent activity yet.
                    </p>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Add Card Modal */}
      {showAddCard && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-[420px] p-6 relative transform transition-all duration-300 scale-95 opacity-0 animate-[fadeIn_0.25s_ease-out_forwards] text-left">
            {/* Close Button */}
            <button
              onClick={() => setShowAddCard(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-2">Add New Card</h2>
            <p className="text-gray-500 text-sm mb-4">
              Create a new card with a title and category
            </p>

            {/* Title Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                placeholder="Enter card title"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2EE58A]"
              />
            </div>

            {/* Category Select */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2EE58A]"
              >
                <option value="">--Select Category--</option>
                <option value="safeguard">Prepare</option>
                <option value="vulnerability">Detect</option>
                <option value="threat agents">Respond</option>
                <option value="risk">Recover</option>
                <option
                  value="infosec pillars"
                  disabled={infosecCount >= INFOSEC_LIMIT}
                >
                  Lessons Learned
                </option>
              </select>

              {selectedCategory && (
                <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg animate-fadeIn">
                  <p className="text-xs text-blue-800 leading-relaxed italic">
                    {CATEGORY_DESCRIPTIONS[selectedCategory]}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={async () => {
                  const title = newCardTitle;
                  const category = selectedCategory;
                  const description = CATEGORY_DESCRIPTIONS[category];
                  const moderator = JSON.parse(
                    localStorage.getItem("moderator"),
                  );

                  if (!title || !category) {
                    showToast("Please fill in all fields");
                    return;
                  }

                  if (
                    category === "infosec pillars" &&
                    infosecCount >= INFOSEC_LIMIT
                  ) {
                    showToast(
                      "Only 3 InfoSec Pillars cards are allowed.",
                      "warning",
                    );
                    return;
                  }

                  try {
                    const res = await fetch(apiUrl("/card"), {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        card_name: title,
                        category: category,
                        description: description,
                        moderator_id: moderator.moderator_id,
                      }),
                    });

                    if (!res.ok) throw new Error("Failed to add card");

                    const newCard = await res.json();

                    // Update cards in state
                    setCards((prev) => [
                      ...prev,
                      {
                        id: newCard.card_id,
                        title: newCard.card_name,
                        category: newCard.category,
                        description: newCard.description,
                        color:
                          newCard.category === "safeguard"
                            ? "bg-[#67C2C9]/20 text-[#4DA8AF]"
                            : newCard.category === "vulnerability"
                              ? "bg-[#FDEE00]/20 text-yellow-700"
                              : newCard.category === "threat agents"
                                ? "bg-[#FF9EBD]/20 text-pink-700"
                                : newCard.category === "risk"
                                  ? "bg-[#32CD32]/20 text-green-700"
                                  : newCard.category === "infosec pillars"
                                    ? "bg-[#FFB347]/20 text-orange-700"
                                    : "bg-gray-100 text-gray-700",
                        isEditing: false,
                      },
                    ]);

                    // Update total cards count
                    setStats((prev) => ({
                      ...prev,
                      totalCards: prev.totalCards + 1,
                    }));

                    setShowAddCard(false);
                    setNewCardTitle("");
                    setSelectedCategory("");
                    showToast("Card added successfully!");
                    logActivity(
                      `Added new card "${title}" (${category})`,
                      "success",
                    );
                  } catch (err) {
                    console.error("Error adding card:", err);
                    showToast("Failed to add card.");
                  }
                }}
                className="px-4 py-2 rounded-full bg-[#2EE58A] hover:bg-[#23c877] text-white font-semibold"
              >
                Add Card
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Manage Cards Modal */}
      {showManageCards && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-200">
          <div
            className="bg-white rounded-2xl shadow-2xl w-[850px] h-[650px]
                relative text-left overflow-hidden animate-[fadeIn_0.25s_ease-out_forwards]
                flex flex-col"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white z-20 px-6 pt-6 border-b border-gray-200">
              <button
                onClick={() => setShowManageCards(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg"
              >
                <X size={20} />
              </button>
              <h2 className="text-2xl font-bold mb-2">Manage Cards</h2>
              <p className="text-gray-500 text-sm mb-6">
                Edit or delete existing cards by category
              </p>

              {/* Tabs */}
              <div className="flex gap-4 border-b border-gray-200">
                {CARD_TABS.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setActiveTab(value)}
                    className={`
                      flex items-center justify-center
                      w-44 pb-2 font-semibold transition-all
                      border-b-2
                      ${
                        activeTab === value
                          ? tabColors[value]
                          : "text-gray-500 hover:text-gray-700 border-transparent"
                      }
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Card Grid */}
            <div className="mt-6 flex-1 overflow-y-auto hide-scrollbar px-8 pt-6 pb-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 md:grid-cols-3 gap-5">
                {cards
                  .filter((c) => {
                    const map = {
                      "Safeguards / Controls": "safeguard",
                      Vulnerabilities: "vulnerability",
                      "Threat Agents": "threat agents",
                      Risks: "risk",
                      "InfoSec Pillars": "infosec pillars",
                    };
                    return c.category === map[activeTab];
                  })
                  .map((card) => (
                    <div
                      key={card.id}
                      className={`flex flex-col justify-between 
                                  border rounded-2xl shadow-sm p-4
                                  transition transform hover:scale-[1.02] hover:shadow-md
                                  ${card.color}
                                  w-[180px] h-[220px]`}
                    >
                      {/* Title and Category */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-bold text-gray-800 truncate text-sm">
                            {card.title}
                          </h3>
                        </div>

                        <p className="text-[10px] uppercase tracking-wider font-semibold opacity-70 mb-2">
                          {card.category}
                        </p>

                        <p className="text-[11px] text-gray-600 line-clamp-4 leading-tight">
                          {card.description || "No description provided"}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-2 mt-auto">
                        <button
                          onClick={() => setEditingCard({ ...card })}
                          className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition flex items-center justify-center"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(card.id)}
                          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition flex items-center justify-center"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Teams Modal */}
      {showViewTeams && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-200">
          <div
            className="
              bg-white rounded-2xl shadow-2xl 
              w-[850px] h-[650px] 
              p-8 relative text-left 
              overflow-hidden 
              transform transition-all duration-300 scale-95 opacity-0 animate-[fadeIn_0.25s_ease-out_forwards]"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowViewTeams(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <h2 className="text-2xl font-bold mb-2">Team Management</h2>
            <p className="text-gray-500 text-sm mb-6">
              View and manage all registered teams
            </p>

            {/* Search */}
            <div className="mb-6 flex justify-between items-center">
              <input
                type="text"
                placeholder="Search teams"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-[#2EE58A]"
              />
              <span className="text-sm text-gray-500">
                {filteredTeams.length} teams
              </span>
            </div>

            {/* Teams List */}
            <div className="max-h-[500px] overflow-y-auto pr-2 scroll-smooth pb-14">
              <div className="space-y-4">
                {filteredTeams.length > 0 ? (
                  filteredTeams.map((team) => (
                    <div
                      key={team.id}
                      className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
                    >
                      {/* Team Info */}
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {team.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Leader: {team.leader}
                        </p>
                      </div>

                      {/* Status + Actions */}
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-4 py-2 text-xs font-medium rounded-full ${
                            team.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {team.status}
                        </span>
                        <button
                          onClick={() => handleDeleteTeam(team.id)}
                          className="px-4 py-2 rounded-full bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold flex items-center gap-1"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center mt-10">
                    No teams found.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <GameSettingsModal
        show={showGameSettings}
        onCloseRequest={() => setShowGameSettings(false)}
        showToast={showToast}
        confirmToast={confirmToast}
        logActivity={logActivity}
        refreshDashboard={refreshDashboard}
      />

      <CreateGameModal
        show={showCreateGame}
        onClose={() => setShowCreateGame(false)}
        showToast={showToast}
        logActivity={logActivity}
        refreshDashboard={refreshDashboard}
      />

      <AddThreatModal
        show={showAddThreat}
        onClose={() => setShowAddThreat(false)}
        categories={categories}
        showToast={showToast}
        logActivity={logActivity}
        refreshDashboard={refreshDashboard}
      />

      <ManageThreatsModal
        show={showManageThreats}
        onClose={() => setShowManageThreats(false)}
        showToast={showToast}
        logActivity={logActivity}
        refreshDashboard={refreshDashboard}
        confirmToast={confirmToast}
      />

      {/* Edit Card Modal */}
      {editingCard && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-[60] transition-opacity duration-200">
          <div
            className={`rounded-2xl shadow-2xl w-[450px] p-8 relative transform transition-all duration-300 scale-95 opacity-0 animate-[fadeIn_0.25s_ease-out_forwards] text-left border border-white/50 ${getCategoryColorClass(editingCard.pendingCategory)}`}
          >
            <button
              onClick={() => setEditingCard(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold mb-6">Edit Card</h2>

            {/* Title */}
            <div className="mb-5">
              <label className="block text-sm font-semibold opacity-80 mb-2">
                Card Title
              </label>
              <input
                type="text"
                value={editingCard.title}
                onChange={(e) =>
                  setEditingCard({ ...editingCard, title: e.target.value })
                }
                className="w-full border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20 transition bg-white/60 placeholder-gray-500"
                placeholder="Enter card title"
              />
            </div>

            {/* Category */}
            <div className="mb-5">
              <label className="block text-sm font-semibold opacity-80 mb-2">
                Category
              </label>
              <select
                value={editingCard.pendingCategory}
                onChange={(e) =>
                  setEditingCard({
                    ...editingCard,
                    pendingCategory: e.target.value,
                  })
                }
                className="w-full border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20 transition bg-white/60 cursor-pointer"
              >
                <option value="safeguard">Prepare</option>
                <option value="vulnerability">Detect</option>
                <option value="threat agents">Respond</option>
                <option value="risk">Recover</option>
                <option value="infosec pillars">Lessons Learned</option>
              </select>

              <div className="mt-3 p-3 bg-white/40 border-l-4 border-black/20 rounded-r-lg">
                <p className="text-[11px] font-medium leading-relaxed italic">
                  {CATEGORY_DESCRIPTIONS[editingCard.pendingCategory]}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <label className="block text-sm font-semibold opacity-80 mb-2">
                Back Description
              </label>
              <textarea
                value={editingCard.description || ""}
                onChange={(e) =>
                  setEditingCard({
                    ...editingCard,
                    description: e.target.value,
                  })
                }
                rows={4}
                className="w-full border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20 transition resize-none leading-relaxed text-sm bg-white/60 placeholder-gray-500"
                placeholder="Description shown on the back of the card"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={async () => {
                try {
                  const finalCategory = editingCard.pendingCategory;
                  if (
                    editingCard.pendingCategory === "infosec pillars" &&
                    editingCard.category !== "infosec pillars" &&
                    infosecCount >= INFOSEC_LIMIT
                  ) {
                    showToast(
                      "Only 3 InfoSec Pillars cards are allowed.",
                      "warning",
                    );
                    return;
                  }
                  const res = await fetch(apiUrl(`/card/${editingCard.id}`), {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      card_name: editingCard.title,
                      category: finalCategory,
                      description: editingCard.description,
                    }),
                  });

                  if (!res.ok) throw new Error("Failed to update card");

                  const updatedCard = await res.json();

                  setCards((prev) =>
                    prev.map((c) =>
                      c.id === editingCard.id
                        ? {
                            ...c,
                            title: updatedCard.card_name,
                            category: updatedCard.category,
                            description: updatedCard.description,
                            pendingCategory: updatedCard.category,
                            color:
                              updatedCard.category === "safeguard"
                                ? "bg-[#67C2C9]/20 text-[#4DA8AF]"
                                : updatedCard.category === "vulnerability"
                                  ? "bg-[#FDEE00]/20 text-yellow-700"
                                  : updatedCard.category === "threat agents"
                                    ? "bg-[#FF9EBD]/20 text-pink-700"
                                    : updatedCard.category === "risk"
                                      ? "bg-[#32CD32]/20 text-green-700"
                                      : updatedCard.category ===
                                          "infosec pillars"
                                        ? "bg-[#FFB347]/20 text-orange-700"
                                        : "bg-gray-100 text-gray-700",
                            isEditing: false,
                          }
                        : c,
                    ),
                  );

                  showToast("Card updated successfully!");
                  logActivity(
                    `Updated card "${editingCard.title}"`,
                    "edit",
                  );
                  setEditingCard(null);
                } catch (err) {
                  console.error("Error updating card:", err);
                  showToast("Failed to update card.");
                }
              }}
              className="w-full bg-[#2EE58A] hover:bg-[#23c877] text-white py-4 rounded-xl font-bold transition shadow-lg"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Toast Notif */}
      <div className="fixed bottom-5 right-5 flex flex-col items-end gap-3 z-[9999]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`min-w-[260px] px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-[fadeIn_0.3s_ease-out_forwards] transition-all duration-300
                ${
                  toast.type === "success"
                    ? "bg-[#3ce28a] text-white"
                    : toast.type === "error"
                      ? "bg-[#f05c74] text-white"
                      : toast.type === "warning"
                        ? "bg-yellow-500 text-white"
                        : toast.type === "confirm"
                          ? "bg-white border border-gray-200 text-gray-800 shadow-xl"
                          : "bg-[#0d97fb] text-white"
                }`}
          >
            {toast.type === "confirm" ? (
              <div className="flex flex-col items-start">
                <p className="mb-3 font-semibold">{toast.message}</p>
                <div className="flex gap-2 self-end">
                  <button
                    onClick={toast.onConfirm}
                    className="bg-green-200 hover:bg-green-300 text-green-800 px-3 py-1 rounded-md text-xs font-semibold transition shadow-sm"
                  >
                    Yes
                  </button>
                  <button
                    onClick={toast.onCancel}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md text-xs font-semibold transition shadow-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p>{toast.message}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
