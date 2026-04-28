import React, { useState, useCallback, useEffect } from "react";
import { X, Trash2, Plus } from "lucide-react";
import { apiUrl } from "../../../config/api";

export default function ManageThreatsModal({
  show,
  onClose,
  showToast,
  logActivity,
  refreshDashboard,
  confirmToast,
}) {
  const [activeTab, setActiveTab] = useState("threats");

  // threats
  const [threats, setThreats] = useState([]);
  const [searchThreat, setSearchThreat] = useState("");

  // categories
  const [categories, setCategories] = useState([]);
  const [searchCategory, setSearchCategory] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // fetch threats
  const fetchThreats = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/threat"));
      if (!res.ok) throw new Error("Failed to fetch threats");

      const data = await res.json();
      setThreats(data);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch threats", "error");
    }
  }, [showToast]);

  // fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/category"));
      if (!res.ok) throw new Error("Failed to fetch categories");

      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch categories", "error");
    }
  }, [showToast]);

  // load data when modal opens
  useEffect(() => {
    if (show) {
      fetchThreats();
      fetchCategories();
    }
  }, [show, fetchThreats, fetchCategories]);

  // delete threat
  const handleDeleteThreat = async (threat) => {
    const confirmed = await confirmToast("Delete this threat?");
    if (!confirmed) return;

    try {
      const res = await fetch(apiUrl(`/threat/${threat.threat_id}`), {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete threat");

      showToast("Threat deleted!", "success");
      logActivity(`Deleted threat "${threat.description}"`, "delete");

      fetchThreats();
      refreshDashboard();
    } catch (err) {
      console.error(err);
      showToast("Failed to delete threat", "error");
    }
  };

  // add category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      showToast("Enter a category name", "warning");
      return;
    }

    const moderator = JSON.parse(localStorage.getItem("moderator"));
    const created_by = moderator?.moderator_id;

    try {
      const res = await fetch(apiUrl("/category"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_name: newCategory,
          created_by,
        }),
      });

      if (!res.ok) throw new Error("Failed to add category");

      showToast("Category added!", "success");
      logActivity(`Added new threat category "${newCategory}"`, "success");
      setNewCategory("");
      setAddingCategory(false);
      fetchCategories();
      refreshDashboard();
    } catch (err) {
      console.error(err);
      showToast("Failed to add category", "error");
    }
  };

  // delete category
  const handleDeleteCategory = async (id) => {
    const confirmed = await confirmToast("Delete this category?");
    if (!confirmed) return;

    try {
      const res = await fetch(apiUrl(`/category/${id}`), {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete category");

      showToast("Category deleted!", "success");
      logActivity(`Deleted threat category ID ${id}`, "delete");

      fetchCategories();
      refreshDashboard();
    } catch (err) {
      console.error(err);
      showToast("Failed to delete category", "error");
    }
  };

  if (!show) return null;

  const filteredThreats = threats.filter((t) =>
    t.description?.toLowerCase().includes(searchThreat.toLowerCase()),
  );

  const filteredCategories = categories.filter((c) =>
    c.category_name?.toLowerCase().includes(searchCategory.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">
      <div
        className="bg-white rounded-2xl shadow-2xl w-[850px] h-[650px] p-8 relative 
                      animate-[fadeIn_0.25s_ease-out_forwards] scale-95 opacity-0 
                      text-left flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-1">Manage Threats</h2>
        <p className="text-gray-500 text-sm mb-6">
          Manage threats and threat categories.
        </p>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            className={`pb-2 font-semibold ${activeTab === "threats"
                ? "border-b-2 border-[#2EE58A]"
                : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
              }`}
            onClick={() => setActiveTab("threats")}
          >
            Threats
          </button>

          <button
            className={`pb-2 font-semibold ${activeTab === "categories"
                ? "border-b-2 border-purple-500"
                : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
              }`}
            onClick={() => setActiveTab("categories")}
          >
            Threat Categories
          </button>

          <button
            className={`pb-2 font-semibold ${activeTab === "answers"
                ? "border-b-2 border-yellow-500"
                : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
              }`}
            onClick={() => setActiveTab("answers")}
          >
            Threat Answers
          </button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          {/* Threats Tab*/}
          {activeTab === "threats" && (
            <>
              <div className="flex justify-between items-center mb-4">
                <input
                  type="text"
                  placeholder="Search threats"
                  value={searchThreat}
                  onChange={(e) => setSearchThreat(e.target.value)}
                  className="border border-gray-300 rounded-md px-4 py-2 w-1/2 
                             focus:outline-none focus:ring-2 focus:ring-[#2EE58A]"
                />
                <span className="text-sm text-gray-500">
                  {filteredThreats.length} threats
                </span>
              </div>

              <div className="overflow-y-auto flex-1 min-h-0 max-h-full space-y-3 pr-1 pb-4">
                {filteredThreats.map((t) => (
                  <ThreatRow
                    key={t.threat_id}
                    threat={t}
                    categories={categories}
                    showToast={showToast}
                    refreshDashboard={refreshDashboard}
                    fetchThreats={fetchThreats}
                    handleDeleteThreat={handleDeleteThreat}
                  />
                ))}
              </div>
            </>
          )}

          {/* Categories Tab */}
          {activeTab === "categories" && (
            <>
              <div className="flex justify-between items-center mb-4">
                <input
                  type="text"
                  placeholder="Search categories"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="border border-gray-300 rounded-md px-4 py-2 w-1/2 
                             focus:outline-none focus:ring-2 focus:ring-[#2EE58A]"
                />

                {!addingCategory ? (
                  <button
                    onClick={() => setAddingCategory(true)}
                    className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700
                               rounded-full text-sm font-semibold flex items-center gap-2"
                  >
                    <Plus size={16} /> Add
                  </button>
                ) : (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Category name"
                      className="border border-gray-300 rounded-md px-3 py-2 
                                 focus:outline-none focus:ring-2 focus:ring-[#2EE58A]"
                    />

                    <button
                      onClick={handleAddCategory}
                      className="px-3 py-2 bg-[#2EE58A] hover:bg-[#23c877] text-white rounded-full text-sm"
                    >
                      Add
                    </button>

                    <button
                      onClick={() => {
                        setAddingCategory(false);
                        setNewCategory("");
                      }}
                      className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="overflow-y-auto flex-1 min-h-0 max-h-full space-y-3 pr-1 pb-4">
                {filteredCategories.map((c) => {
                  const isExpanded = c.expanded;

                  return (
                    <div
                      key={c.category_id}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-4"
                    >
                      <div className="flex justify-between items-center">
                        <span
                          className="font-semibold cursor-pointer"
                          onClick={async () => {
                            if (!c.expanded) {
                              try {
                                const res = await fetch(
                                  apiUrl(`/category/${c.category_id}/threats`),
                                );
                                const data = await res.json();

                                setCategories((prev) =>
                                  prev.map((cat) =>
                                    cat.category_id === c.category_id
                                      ? {
                                        ...cat,
                                        expanded: true,
                                        threats: data,
                                      }
                                      : cat,
                                  ),
                                );
                              } catch (err) {
                                console.error(err);
                                showToast("Failed to load threats", "error");
                              }
                            } else {
                              setCategories((prev) =>
                                prev.map((cat) =>
                                  cat.category_id === c.category_id
                                    ? { ...cat, expanded: false }
                                    : cat,
                                ),
                              );
                            }
                          }}
                        >
                          {c.category_name}
                        </span>

                        <button
                          onClick={() => handleDeleteCategory(c.category_id)}
                          className="px-4 py-2 rounded-full bg-red-100 hover:bg-red-200 
                                     text-red-700 text-xs font-semibold flex items-center gap-1"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 bg-white/70 backdrop-blur-sm rounded-xl p-3 space-y-2 max-h-[200px] overflow-y-auto pb-3 shadow">
                          {c.threats?.length === 0 ? (
                            <p className="text-gray-400 text-sm">
                              No threats in this category.
                            </p>
                          ) : (
                            c.threats.map((t) => (
                              <div
                                key={t.threat_id}
                                className="flex justify-between items-center bg-gray-100 rounded-lg px-3 py-2"
                              >
                                <span>{t.description}</span>

                                <button
                                  onClick={async () => {
                                    try {
                                      await fetch(
                                        apiUrl("/threat-category/unassign"),
                                        {
                                          method: "DELETE",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                          body: JSON.stringify({
                                            category_id: c.category_id,
                                            threat_id: t.threat_id,
                                          }),
                                        },
                                      );

                                      showToast(
                                        "Threat removed from category",
                                        "success",
                                      );
                                      logActivity(
                                        `Unassigned threat "${t.description}" from category "${c.category_name}"`,
                                        "edit",
                                      );

                                      const res = await fetch(
                                        apiUrl(
                                          `/category/${c.category_id}/threats`,
                                        ),
                                      );
                                      const data = await res.json();

                                      setCategories((prev) =>
                                        prev.map((cat) =>
                                          cat.category_id === c.category_id
                                            ? { ...cat, threats: data }
                                            : cat,
                                        ),
                                      );
                                    } catch (err) {
                                      console.error(err);
                                      showToast(
                                        "Failed to remove threat",
                                        "error",
                                      );
                                    }
                                  }}
                                  className="px-3 py-1 rounded-full bg-red-100 hover:bg-red-200 text-red-700 text-xs"
                                >
                                  Remove
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Threat Answers Tab */}
          {activeTab === "answers" && (
            <>
              <div className="flex justify-between items-center mb-4">
                <input
                  type="text"
                  placeholder="Search threats"
                  value={searchThreat}
                  onChange={(e) => setSearchThreat(e.target.value)}
                  className="border border-gray-300 rounded-md px-4 py-2 w-1/2 
                            focus:outline-none focus:ring-2 focus:ring-[#2EE58A]"
                />

                <span className="text-sm text-gray-500">
                  {filteredThreats.length} threats
                </span>
              </div>

              <div className="overflow-y-auto flex-1 min-h-0 max-h-full space-y-3 pr-1 pb-4 manage-threats-modal-scroll">
                {filteredThreats.map((t) => (
                  <ThreatAnswerRow
                    key={t.threat_id}
                    threat={t}
                    categories={categories}
                    showToast={showToast}
                    confirmToast={confirmToast}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// threat row
function ThreatRow({
  threat,
  categories,
  showToast,
  refreshDashboard,
  fetchThreats,
  handleDeleteThreat,
}) {
  const [editing, setEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    threat.category_id || "",
  );

  const handleSave = async () => {
    if (!selectedCategory) {
      showToast("Select a category", "warning");
      return;
    }

    try {
      const res = await fetch(apiUrl("/threat-category/assign"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: selectedCategory,
          threat_id: threat.threat_id,
        }),
      });

      if (!res.ok) throw new Error("Failed to update category");

      showToast("Threat category updated!", "success");

      setEditing(false);
      fetchThreats();
      refreshDashboard();
    } catch (err) {
      console.error(err);
      showToast("Error updating category", "error");
    }
  };

  return (
    <div
      className="flex justify-between items-center bg-gray-50 border 
                      border-gray-200 rounded-xl p-4"
    >
      <div>
        <p className="font-semibold">{threat.description}</p>

        {editing ? (
          <select
            className="mt-2 border rounded-md px-2 py-1 text-sm h-7.5 leading-nonefocus:outline-none
                          focus:ring-2 focus:ring-[#2EE58A]
                          focus:border-[#2EE58A]"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.category_name}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm text-gray-500 mt-1">
            Category:{" "}
            {categories.find((c) => c.category_id === threat.category_id)
              ?.category_name || "Unassigned"}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        {!editing ? (
          <>
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 rounded-full bg-blue-100 hover:bg-blue-200 
                          text-blue-700 text-xs font-semibold"
            >
              Edit
            </button>

            <button
              onClick={() => handleDeleteThreat(threat)}
              className="px-4 py-2 rounded-full bg-red-100 hover:bg-red-200 
                          text-red-700 text-xs font-semibold flex items-center gap-1"
            >
              <Trash2 size={15} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-full bg-green-100 hover:bg-green-200 
                          text-green-700 text-xs font-semibold"
            >
              Save
            </button>

            <button
              onClick={() => {
                setEditing(false);
                setSelectedCategory(threat.category_id || "");
              }}
              className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 
                          text-gray-700 text-xs font-semibold"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// threat answer row
function ThreatAnswerRow({ threat, categories, showToast }) {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigned, setAssigned] = useState([]);
  const [groupedCards, setGroupedCards] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchCardsAndAnswers = useCallback(async () => {
    setLoading(true);

    try {
      // GET all cards
      const cardRes = await fetch(apiUrl("/card"));
      const cardsData = await cardRes.json();

      // GET threat answers
      const ansRes = await fetch(
        apiUrl(`/threat-answer/threat/${threat.threat_id}/answers`),
      );

      let ansData = [];

      if (ansRes.ok) {
        const json = await ansRes.json();
        ansData = json.answers || [];
      }

      setAssigned(ansData);

      // group cards by category
      const groups = {};
      cardsData.forEach((card) => {
        const group = card.category || "Uncategorized";
        if (!groups[group]) groups[group] = [];
        groups[group].push(card);
      });

      setGroupedCards(groups);
    } catch (err) {
      console.error(err);
      showToast("Failed to load data", "error");
    }

    setLoading(false);
  }, [threat, showToast]);

  // Assign/unassign toggle
  const toggleAssign = async (card) => {
    const alreadyAssigned = assigned.some((a) => a.card_id === card.card_id);

    try {
      if (alreadyAssigned) {
        await fetch(
          apiUrl(`/threat-answer/${threat.threat_id}/${card.card_id}`),
          { method: "DELETE" },
        );

        setAssigned((prev) => prev.filter((a) => a.card_id !== card.card_id));
      } else {
        if (
          card.category === "infosec pillars" &&
          assigned.some((a) =>
            groupedCards["infosec pillars"]?.some(
              (c) => c.card_id === a.card_id,
            ),
          )
        ) {
          showToast("Only 1 InfoSec Pillar answer is allowed.", "warning");
          return;
        }
        await fetch(apiUrl("/threat-answer"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            threat_id: threat.threat_id,
            card_id: card.card_id,
            answer_type: "correct",
            points: 5,
          }),
        });

        setAssigned((prev) => [
          ...prev,
          { card_id: card.card_id, answer_type: "correct", points: 5 },
        ]);
      }

      showToast("Updated answers!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to update assignment", "error");
    }
  };

  // Save edited answer type + points
  const saveAnswerUpdate = async (card_id, type, points) => {
    await fetch(apiUrl("/threat-answer"), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        threat_id: threat.threat_id,
        card_id,
        answer_type: type,
        points,
      }),
    });

    setAssigned((prev) =>
      prev.map((a) =>
        a.card_id === card_id ? { ...a, answer_type: type, points } : a,
      ),
    );

    showToast("Answer updated!", "success");
  };

  return (
    <div className=" bg-gray-100 rounded-2xl shadow-md p-5 mb-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 leading-tight">
            {threat.description}
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Category:{" "}
            {categories?.find((c) => c.category_id === threat.category_id)
              ?.category_name || "Unassigned"}
          </p>
        </div>

        <button
          onClick={async () => {
            await fetchCardsAndAnswers();
            setShowAssignModal(true);
          }}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold hover:bg-blue-200 transition"
        >
          Assign Answers
        </button>
      </div>

      {/* Modal */}
      <AssignAnswersModal
        show={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        groupedCards={groupedCards}
        assigned={assigned}
        loading={loading}
        toggleAssign={toggleAssign}
        saveAnswerUpdate={saveAnswerUpdate}
        threat={threat}
      />
    </div>
  );
}

function AssignAnswersModal({
  show,
  onClose,
  groupedCards,
  assigned,
  loading,
  toggleAssign,
  saveAnswerUpdate,
  threat,
}) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [editingCard, setEditingCard] = useState(null);

  const INFOSEC_CATEGORY = "infosec pillars";
  const infosecAssigned = assigned.some((a) =>
    groupedCards[INFOSEC_CATEGORY]?.some((c) => c.card_id === a.card_id),
  );

  useEffect(() => {
    const parentModal = document.querySelector(".manage-threats-modal-scroll");

    if (show) {
      document.body.style.overflow = "hidden";
      if (parentModal) parentModal.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      if (parentModal) parentModal.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      if (parentModal) parentModal.style.overflow = "";
    };
  }, [show]);

  useEffect(() => {
    if (!activeCategory && Object.keys(groupedCards).length > 0) {
      setActiveCategory(Object.keys(groupedCards)[0]);
    }
  }, [groupedCards, activeCategory]);

  if (!show) return null;

  const getCardColor = (cat) => {
    switch (cat?.toLowerCase()) {
      case "safeguard":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "vulnerability":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "threat agents":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "risk":
        return "bg-red-100 text-red-700 border-red-300";
      case "infosec pillars":
        return "bg-purple-100 text-purple-700 border-purple-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[750px] h-[600px] shadow-xl flex flex-col">
        {/* HEADER */}
        <div className="sticky top-0 bg-white z-20 px-6 pt-6 pb-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl font-bold pr-10 mb-4">{threat.description}</h2>

          {/* CATEGORY TABS */}
          <div className="border-b border-gray-200 pb-0 mb-2">
            <div className="flex justify-center gap-10">
              {[
                "safeguard",
                "vulnerability",
                "threat agents",
                "risk",
                "infosec pillars",
              ].map((cat) => {
                if (!groupedCards[cat]) return null;

                const active = activeCategory === cat;

                const underlineColor =
                  cat === "safeguard"
                    ? "bg-yellow-400"
                    : cat === "vulnerability"
                      ? "bg-blue-400"
                      : cat === "threat agents"
                        ? "bg-orange-400"
                        : cat === "risk"
                          ? "bg-red-400"
                          : cat === "infosec pillars"
                            ? "bg-purple-400"
                            : "bg-gray-400";

                const prettyLabel =
                  cat === "safeguard"
                    ? "Safeguards"
                    : cat.replace(/\b\w/g, (c) => c.toUpperCase());

                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`pb-3 text-sm font-medium relative ${active
                        ? "text-gray-900 font-semibold"
                        : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    {prettyLabel}
                    {active && (
                      <span
                        className={`absolute left-0 right-0 -bottom-[2px] h-[2px] rounded-full ${underlineColor}`}
                      ></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <p className="text-gray-500">Loading cards...</p>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {activeCategory &&
                groupedCards[activeCategory]?.map((card) => {
                  const answer = assigned.find(
                    (a) => a.card_id === card.card_id,
                  );
                  const isAssigned = !!answer;

                  return (
                    <div
                      key={card.card_id}
                      className={` rounded-2xl shadow-sm hover:shadow-md border p-4 flex flex-col 
                          justify-between transition duration-200 h-[100px]
                          ${getCardColor(card.category)}
                        `}
                    >
                      {/* HEADER ROW */}
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-sm leading-tight">
                          {card.card_name}
                        </h3>

                        <input
                          type="checkbox"
                          checked={isAssigned}
                          disabled={
                            card.category === "infosec pillars" &&
                            infosecAssigned &&
                            !isAssigned
                          }
                          onChange={() => toggleAssign(card)}
                          className="scale-110 accent-blue-600 disabled:opacity-50"
                        />
                      </div>

                      {/* EDIT BUTTON */}
                      {isAssigned && (
                        <button
                          onClick={() => setEditingCard(card)}
                          className=" mt-4 ml-auto px-3 py-2 bg-white/60 hover:bg-white/80 
                              text-xs font-semibold rounded-xl transition"
                        >
                          Edit Answer
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        <EditAnswerModal
          show={!!editingCard}
          onClose={() => setEditingCard(null)}
          card={editingCard}
          answer={assigned.find((a) => a.card_id === editingCard?.card_id)}
          save={({ type, points }) => {
            saveAnswerUpdate(editingCard.card_id, type, points);
            setEditingCard(null);
          }}
        />
      </div>
    </div>
  );
}

function EditAnswerModal({ show, onClose, card, answer, save }) {
  const [type, setType] = useState(answer?.answer_type || "correct");
  const [points, setPoints] = useState(answer?.points || 5);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">
      <div
        className=" bg-white rounded-2xl shadow-2xl w-[420px] p-6 
            relative text-left animate-[fadeIn_0.25s_ease-out_forwards]
            scale-95 opacity-0"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <h2 className="text-xl font-bold mb-2">Edit Answer</h2>
        <p className="text-gray-500 text-sm mb-4">
          Modify the answer type and point value for this card.
        </p>

        {/* Card Name Display */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card
          </label>
          <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100">
            {card?.card_name}
          </div>
        </div>

        {/* Answer Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Answer Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className=" w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2EE58A]"
          >
            <option value="correct">Correct</option>
            <option value="close">Close</option>
            <option value="wrong">Wrong</option>
          </select>
        </div>

        {/* Points Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Points
          </label>
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(parseInt(e.target.value))}
            min="0"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2EE58A]"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={() => save({ type, points })}
            className="px-4 py-2 rounded-full bg-[#2EE58A] hover:bg-[#23c877] 
                        text-white font-semibold"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
