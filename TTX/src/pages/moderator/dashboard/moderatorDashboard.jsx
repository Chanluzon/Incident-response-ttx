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
import FormattedDescription from "../../../components/FormattedDescription";

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
    { label: "Prepare", value: "prepare" },
    { label: "Detect", value: "detect" },
    { label: "Respond", value: "respond" },
    { label: "Recover", value: "recover" },
    { label: "Lessons Learned", value: "lessons learned" },
  ];



  const moderator = JSON.parse(localStorage.getItem("moderator"));

  const [loading, setLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showManageCards, setShowManageCards] = useState(false);
  const [showAddThreat, setShowAddThreat] = useState(false);
  const [showManageThreats, setShowManageThreats] = useState(false);
  const [categories, setCategories] = useState([]);

  const [activeTab, setActiveTab] = useState("prepare");
  const [cards, setCards] = useState([]);
  const [selectedCardIds, setSelectedCardIds] = useState([]);

  const getCategoryColorClass = (cat) => {
    switch (cat) {
      case "prepare":
        return "bg-[#67C2C9]/20 text-[#4DA8AF]";
      case "detect":
        return "bg-[#FDEE00]/20 text-yellow-700";
      case "respond":
        return "bg-[#FF9EBD]/20 text-pink-700";
      case "recover":
        return "bg-[#32CD32]/20 text-green-700";
      case "lessons learned":
        return "bg-[#FFB347]/20 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };
  const [teams, setTeams] = useState([]);
  const infosecCount = cards.filter(
    (c) => c.category === "lessons learned",
  ).length;

  const [showGameSettings, setShowGameSettings] = useState(false);
  const [showCreateGame, setShowCreateGame] = useState(false);

  const [recentActivity, setRecentActivity] = useState([]);
  const [toasts, setToasts] = useState([]);

  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDescription, setNewCardDescription] = useState("");
  const [newCardImage, setNewCardImage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editingCard, setEditingCard] = useState(null);

  const handleImageUpload = (e, setBase64Str) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Str(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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
        cardToUpdate.pendingCategory === "lessons learned" &&
        cardToUpdate.category !== "lessons learned" &&
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
                updatedCard.category === "prepare"
                  ? "bg-[#67C2C9]/20 text-[#4DA8AF]"
                  : updatedCard.category === "detect"
                    ? "bg-[#FDEE00]/20 text-yellow-700"
                    : updatedCard.category === "respond"
                      ? "bg-[#FF9EBD]/20 text-pink-700"
                      : updatedCard.category === "recover"
                        ? "bg-[#32CD32]/20 text-green-700"
                        : updatedCard.category === "lessons learned"
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
      setSelectedCardIds((prev) => prev.filter((selectedId) => selectedId !== id));

      showToast("Card deleted successfully!", "success");
      logActivity(`Deleted a card`, "delete");
    } catch (err) {
      console.error("Error deleting card:", err);
      showToast("Failed to delete card.", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCardIds.length === 0) return;

    const confirmed = await confirmToast(
      `Are you sure you want to delete ${selectedCardIds.length} selected cards?`,
    );
    if (!confirmed) return;

    try {
      const res = await fetch(apiUrl("/card/bulk-delete"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedCardIds }),
      });

      if (!res.ok) throw new Error("Failed to delete cards");

      const data = await res.json();

      setCards((prev) => prev.filter((c) => !selectedCardIds.includes(c.id)));
      setStats((prev) => ({
        ...prev,
        totalCards: prev.totalCards - selectedCardIds.length,
      }));
      setSelectedCardIds([]);

      showToast(data.message, "success");
      logActivity(`Deleted ${selectedCardIds.length} cards`, "delete");
    } catch (err) {
      console.error("Error bulk deleting cards:", err);
      showToast("Failed to delete selected cards.", "error");
    }
  };

  const toggleCardSelection = (id) => {
    setSelectedCardIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
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
          image: c.image,
          pendingCategory: c.category,
          color:
            c.category === "prepare"
              ? "bg-[#67C2C9]/20 text-[#4DA8AF]"
              : c.category === "detect"
                ? "bg-[#FDEE00]/20 text-yellow-700"
                : c.category === "respond"
                  ? "bg-[#FF9EBD]/20 text-pink-700"
                  : c.category === "recover"
                    ? "bg-[#32CD32]/20 text-green-700"
                    : c.category === "lessons learned"
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
    prepare: "border-[#67C2C9]",
    detect: "border-[#FDEE00]",
    respond: "border-[#FF9EBD]",
    recover: "border-[#32CD32]",
    "lessons learned": "border-[#FFB347]",
  };

  const categoryUnderline = {
    prepare: "border-yellow-700",
    detect: "border-blue-700",
    "respond": "border-orange-700",
    recover: "border-red-700",
    "lessons learned": "border-pink-700",
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
                  <ShieldAlert size={28} /> Scenario Management
                </h2>

                <p className="text-gray-500 text-sm mb-4 leading-snug">
                  View, create, and manage scenarios.
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
                    <Plus size={16} /> Add Scenario
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
                        className={`bg-white rounded-xl px-5 py-3 flex justify-between items-center shadow-sm hover:shadow-md transition border-l-4 ${activity.type === "success"
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
          <div className={`rounded-2xl shadow-2xl w-[420px] p-6 relative transform transition-all duration-300 scale-95 opacity-0 animate-[fadeIn_0.25s_ease-out_forwards] text-left border border-white/50 transition-colors duration-500 ${getCategoryColorClass(selectedCategory)}`}>
            {/* Close Button */}
            <button
              onClick={() => setShowAddCard(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-black mb-1">Add New Card</h2>
            <p className="text-[11px] font-bold opacity-60 uppercase tracking-wider mb-6">
              Create a new scenario asset
            </p>



            {/* Category Select */}
            <div className="mb-5">
              <label className="block text-xs font-black opacity-80 uppercase tracking-tighter mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20 transition bg-white/60 text-sm cursor-pointer"
              >
                <option value="">--Select Category--</option>
                <option value="prepare">Prepare</option>
                <option value="detect">Detect</option>
                <option value="respond">Respond</option>
                <option value="recover">Recover</option>
                <option value="lessons learned">Lessons Learned</option>
              </select>
            </div>

            {/* Image Input */}
            <div className="mb-5">
              <label className="block text-xs font-black opacity-80 uppercase tracking-tighter mb-2">
                Card Image
              </label>
              <div
                onClick={() => document.getElementById('new-card-image-input').click()}
                className="relative group cursor-pointer"
              >
                <div className="w-full border-2 border-dashed border-black/10 rounded-xl p-2 transition bg-white/40 hover:bg-white/60 hover:border-black/20 flex flex-col items-center justify-center gap-1 group-active:scale-[0.98]">
                  {newCardImage ? (
                    <div className="relative w-full h-16">
                      <img src={newCardImage} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                        <p className="text-[9px] text-white font-bold uppercase">Change</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-1.5 rounded-full bg-white/50 text-slate-500 group-hover:text-slate-800 transition-colors">
                        <Plus size={16} />
                      </div>
                      <p className="text-[9px] font-black opacity-40 uppercase tracking-widest">Upload image</p>
                    </>
                  )}
                </div>
                <input
                  id="new-card-image-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, setNewCardImage)}
                  className="hidden"
                />
              </div>
            </div>

            {/* Description Input */}
            <div className="mb-8">
              <label className="block text-xs font-black opacity-80 uppercase tracking-tighter mb-2">
                Card Description
              </label>
              <textarea
                placeholder="Enter card description..."
                value={newCardDescription}
                onChange={(e) => setNewCardDescription(e.target.value)}
                rows={3}
                className="w-full border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20 transition resize-none leading-relaxed text-sm bg-white/60 placeholder-gray-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={async () => {
                  const category = selectedCategory;
                  const description = newCardDescription;
                  const moderator = JSON.parse(
                    localStorage.getItem("moderator"),
                  );

                  if (!category || !description) {
                    showToast("Please fill in all fields");
                    return;
                  }

                  // Use description as title for DB
                  const title = description.substring(0, 50) || "New Card";

                  try {
                    const res = await fetch(apiUrl("/card"), {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        card_name: title,
                        category: category,
                        description: description,
                        moderator_id: moderator.moderator_id,
                        image: newCardImage,
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
                        image: newCard.image,
                        color:
                          newCard.category === "prepare"
                            ? "bg-[#67C2C9]/20 text-[#4DA8AF]"
                            : newCard.category === "detect"
                              ? "bg-[#FDEE00]/20 text-yellow-700"
                              : newCard.category === "respond"
                                ? "bg-[#FF9EBD]/20 text-pink-700"
                                : newCard.category === "recover"
                                  ? "bg-[#32CD32]/20 text-green-700"
                                  : newCard.category === "lessons learned"
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
                    setNewCardDescription("");
                    setNewCardImage("");
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
                className="w-full bg-[#2EE58A] hover:bg-[#23c877] text-white py-4 rounded-xl font-black shadow-lg transition-all active:scale-95 text-sm uppercase tracking-widest"
              >
                Create Card
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
                onClick={() => {
                  setShowManageCards(false);
                  setSelectedCardIds([]);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg"
              >
                <X size={20} />
              </button>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Manage Cards</h2>
                  <p className="text-slate-500 text-xs font-medium mt-1">
                    Organize, edit, or remove your scenario assets
                  </p>
                </div>
                {selectedCardIds.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-2 animate-bounceIn shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all active:scale-95 mr-10 group"
                  >
                    <Trash2 size={16} className="group-hover:rotate-12 transition-transform" />
                    Delete {selectedCardIds.length} {selectedCardIds.length === 1 ? 'Card' : 'Cards'}
                  </button>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-2 border-b border-gray-200 overflow-x-auto hide-scrollbar">
                {CARD_TABS.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => {
                      setActiveTab(value);
                      setSelectedCardIds([]);
                    }}
                    className={`
                      flex items-center justify-center
                      min-w-[120px] px-4 pb-2 font-semibold transition-all
                      border-b-2 whitespace-nowrap
                      ${activeTab === value
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

            {/* Card Grid Header (Select All) */}
            <div className="px-8 py-3 bg-slate-50/80 backdrop-blur-sm border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    id="select-all"
                    checked={
                      cards.filter((c) => c.category === activeTab).length > 0 &&
                      cards
                        .filter((c) => c.category === activeTab)
                        .every((c) => selectedCardIds.includes(c.id))
                    }
                    onChange={(e) => {
                      const currentCategoryCards = cards.filter(
                        (c) => c.category === activeTab,
                      );
                      const currentIds = currentCategoryCards.map((c) => c.id);

                      if (e.target.checked) {
                        setSelectedCardIds((prev) => [
                          ...new Set([...prev, ...currentIds]),
                        ]);
                      } else {
                        setSelectedCardIds((prev) =>
                          prev.filter((id) => !currentIds.includes(id)),
                        );
                      }
                    }}
                    className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all"
                  />
                </div>
                <label
                  htmlFor="select-all"
                  className="text-xs font-black text-slate-600 cursor-pointer select-none uppercase tracking-widest"
                >
                  Select All
                </label>
              </div>

              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-200/50 px-2 py-1 rounded-md">
                Selected: {selectedCardIds.length}
              </div>
            </div>

            {/* Card Grid */}
            <div className="flex-1 overflow-y-auto hide-scrollbar px-8 pt-6 pb-8 bg-slate-50/30">
              <div className="grid grid-cols-2 lg:grid-cols-4 md:grid-cols-3 gap-6">
                {cards
                  .filter((c) => c.category === activeTab)
                  .map((card) => {
                    const isSelected = selectedCardIds.includes(card.id);
                    return (
                      <div
                        key={card.id}
                        onClick={() => toggleCardSelection(card.id)}
                        className={`flex flex-col justify-between 
                                    border-2 rounded-2xl shadow-sm p-4
                                    transition-all duration-300 cursor-pointer group relative
                                    ${isSelected ? 'ring-2 ring-indigo-500/50 border-indigo-500 scale-[1.03] shadow-lg ' + card.color : 'hover:scale-[1.02] hover:shadow-md border-transparent ' + card.color}
                                    w-full h-[240px] overflow-hidden`}
                      >
                        {/* Custom Selection Indicator */}
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full p-1 shadow-lg animate-bounceIn z-10">
                            <Plus size={12} className="rotate-45" />
                          </div>
                        )}

                        {/* Title and Category */}
                        <div className="relative flex-1 overflow-hidden">
                          <div className="flex justify-between items-start mb-2">
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'bg-white/50 border-slate-300'}`}>
                              {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                            </div>
                          </div>

                          {/* Card Image */}
                          {card.image ? (
                            <div className="w-[calc(100%+2rem)] h-[45px] -mt-6 -mx-4 mb-0 flex justify-center items-end overflow-hidden rounded-t-xl">
                              <img src={card.image} alt="card" className="max-w-full max-h-full object-contain" />
                            </div>
                          ) : (
                            <div className="w-[calc(100%+2rem)] h-[45px] -mt-6 -mx-4 mb-0 flex justify-center items-end rounded-t-xl border-b border-dashed border-black/10">
                              <span className="text-[8px] font-bold uppercase tracking-widest opacity-30 text-center leading-tight">No<br />Image</span>
                            </div>
                          )}

                          <div className="px-2 py-0.5 rounded-md bg-black/5 border border-black/10 text-[7px] uppercase font-black tracking-widest opacity-70 mb-1.5 mx-auto w-fit">
                            {card.category}
                          </div>

                          <div className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed font-medium">
                            <FormattedDescription description={card.description} isCard={true} />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 mt-auto pt-4 border-t border-black/5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCard({ ...card });
                            }}
                            className="p-2 rounded-xl bg-white/80 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center justify-center active:scale-90"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(card.id);
                            }}
                            className="p-2 rounded-xl bg-white/80 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center justify-center active:scale-90"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
                          className={`px-4 py-2 text-xs font-medium rounded-full ${team.status === "Active"
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
                <option value="prepare">Prepare</option>
                <option value="detect">Detect</option>
                <option value="respond">Respond</option>
                <option value="recover">Recover</option>
                <option value="lessons learned">Lessons Learned</option>
              </select>
            </div>

            {/* Image Input */}
            <div className="mb-5">
              <label className="block text-xs font-black opacity-80 uppercase tracking-tighter mb-2">
                Card Image
              </label>
              <div
                onClick={() => document.getElementById('edit-card-image-input').click()}
                className="relative group cursor-pointer"
              >
                <div className="w-full border-2 border-dashed border-black/10 rounded-xl p-2 transition bg-white/40 hover:bg-white/60 hover:border-black/20 flex flex-col items-center justify-center gap-1 group-active:scale-[0.98]">
                  {editingCard.image ? (
                    <div className="relative w-full h-16">
                      <img src={editingCard.image} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                        <p className="text-[9px] text-white font-bold uppercase">Change</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-1.5 rounded-full bg-white/50 text-slate-500 group-hover:text-slate-800 transition-colors">
                        <Plus size={16} />
                      </div>
                      <p className="text-[9px] font-black opacity-40 uppercase tracking-widest">Upload image</p>
                    </>
                  )}
                </div>
                <input
                  id="edit-card-image-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageUpload(e, (base64) =>
                      setEditingCard({ ...editingCard, image: base64 }),
                    )
                  }
                  className="hidden"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <label className="block text-xs font-black opacity-80 uppercase tracking-tighter mb-2">
                Card Description
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
                placeholder="Enter card description..."
              />
            </div>

            {/* Save Button */}
            <button
              onClick={async () => {
                try {
                  const finalCategory = editingCard.pendingCategory;
                  const res = await fetch(apiUrl(`/card/${editingCard.id}`), {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      card_name: editingCard.description.substring(0, 50) || "Updated Card",
                      category: finalCategory,
                      description: editingCard.description,
                      image: editingCard.image,
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
                          image: updatedCard.image,
                          pendingCategory: updatedCard.category,
                          color:
                            updatedCard.category === "prepare"
                              ? "bg-[#67C2C9]/20 text-[#4DA8AF]"
                              : updatedCard.category === "detect"
                                ? "bg-[#FDEE00]/20 text-yellow-700"
                                : updatedCard.category === "respond"
                                  ? "bg-[#FF9EBD]/20 text-pink-700"
                                  : updatedCard.category === "recover"
                                    ? "bg-[#32CD32]/20 text-green-700"
                                    : updatedCard.category ===
                                      "lessons learned"
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
                ${toast.type === "success"
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
