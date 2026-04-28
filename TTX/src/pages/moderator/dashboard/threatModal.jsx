import React, { useState } from "react";
import { X } from "lucide-react";
import { apiUrl } from "../../../config/api";

export default function AddThreatModal({ show, onClose, showToast, logActivity, refreshDashboard, categories = [] }) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");

  if (!show) return null;

  const handleAddThreat = async () => {
    if (!name.trim()) {
      showToast("Please enter a threat name", "warning");
      return;
    }

    if (!categoryId) {
      showToast("Please select a category", "warning");
      return;
    }

    try {
      const moderator = JSON.parse(localStorage.getItem("moderator"));

      // cCreate the threat
      const res = await fetch(apiUrl("/threat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: name,
          created_by: moderator.moderator_id,
        }),
      });

      if (!res.ok) throw new Error("Failed to create threat");

      const newThreat = await res.json();

      // assign threat → category
      const linkRes = await fetch(apiUrl("/threat-category"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: categoryId,
          threat_id: newThreat.threat_id,
        }),
      });

      if (!linkRes.ok) throw new Error("Failed to link category");

      showToast("Threat added successfully!", "success");
      logActivity(`Added new threat "${name}"`, "success");
      refreshDashboard();

      setName("");
      setCategoryId("");
      onClose();

    } catch (err) {
      console.error(err);
      showToast("Failed to add threat", "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[420px] p-6 relative text-left animate-[fadeIn_0.25s_ease-out_forwards] scale-95 opacity-0">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-2">Add New Threat</h2>
        <p className="text-gray-500 text-sm mb-4">
          Create a new threat and assign it to a category.
        </p>

        {/* Threat Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Threat Description
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Enter threat description"
            className="w-full border border-gray-300 rounded-md px-3 py-2 
                       focus:outline-none focus:ring-2 focus:ring-[#2EE58A]"
          />
        </div>

        {/* Category Dropdown */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 
                       focus:outline-none focus:ring-2 focus:ring-[#2EE58A]"
          >
            <option value="">--Select category--</option>

            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* Add button */}
        <div className="flex justify-end">
          <button
            onClick={handleAddThreat}
            className="px-4 py-2 rounded-full bg-[#2EE58A] hover:bg-[#23c877] 
                       text-white font-semibold"
          >
            Add Threat
          </button>
        </div>
      </div>
    </div>
  );
}
