import React, { useEffect, useState, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { apiUrl } from "../../../config/api";

export default function ThreatRandomizerModal({
  show,
  onClose,
  showToast,
  onSelectThreat,
  usedThreatIds = [],
}) {

  const [durationMinutes, setDurationMinutes] = useState(15);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [threats, setThreats] = useState([]);
  const [selected, setSelected] = useState(null);

  const [isRolling, setIsRolling] = useState(false);
  const [isSlowing, setIsSlowing] = useState(false);

  const [offset, setOffset] = useState(0);
  const speedRef = useRef(0);
  const animationRef = useRef(null);

  const [bonus, setBonus] = useState(0);

  // load all categories
  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/category"));
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load categories", "error");
    }
  }, [showToast]);

  // load all threats
  const loadAllThreats = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/threat"));
      const data = await res.json();
      const filtered = data.filter(
        (t) => !usedThreatIds.includes(t.threat_id)
      );
      setThreats(filtered);

    } catch (err) {
      console.error(err);
      showToast("Failed to load threats", "error");
    }
  }, [showToast, usedThreatIds]);

  // load threats by category
  const loadThreatsByCategory = useCallback(
    async (categoryId) => {
      try {
        const res = await fetch(
          apiUrl(`/category/${categoryId}/threats`)
        );
        const data = await res.json();
        const filtered = data.filter(
          (t) => !usedThreatIds.includes(t.threat_id)
        );
        setThreats(filtered);

      } catch (err) {
        console.error(err);
        showToast("Failed to load threats", "error");
      }
    },
    [showToast, usedThreatIds]
  );

  // load categories
  useEffect(() => {
    if (show) loadCategories();
    return () => cancelAnimationFrame(animationRef.current);
  }, [show, loadCategories]);

  // category change
  useEffect(() => {
    if (!selectedCategory) {
      setThreats([]);
      return;
    }

    if (selectedCategory === "ALL") {
      loadAllThreats();
    } else {
      loadThreatsByCategory(selectedCategory);
    }
  }, [selectedCategory, loadAllThreats, loadThreatsByCategory]);

  // reset when closed
  useEffect(() => {
    if (!show) {
      setSelected(null);
      setIsRolling(false);
      setIsSlowing(false);
      setOffset(0);
      setSelectedCategory("");
      setThreats([]);
      speedRef.current = 0;

      cancelAnimationFrame(animationRef.current);
    }
  }, [show]);

  useEffect(() => {
    if (!show) {
      setDurationMinutes(15);
      setBonus(0);
    }
  }, [show]);

  // randomizer
  const pickRandom = () =>
    threats[Math.floor(Math.random() * threats.length)];

  const animateReel = () => {
    setOffset((prev) => (prev + speedRef.current) % (threats.length * 60));
    animationRef.current = requestAnimationFrame(animateReel);
  };

  const startRoll = () => {
    if (!threats.length) {
      showToast("No threats available to roll", "warning");
      return;
    }

    setIsRolling(true);
    setIsSlowing(false);

    speedRef.current = 15;
    animationRef.current = requestAnimationFrame(animateReel);
  };

  const stopRoll = () => {
    setIsSlowing(true);

    const slowToStop = () => {
      speedRef.current *= 0.85;

      if (speedRef.current > 1) {
        setTimeout(slowToStop, 60);
      } else {
        speedRef.current = 0;
        cancelAnimationFrame(animationRef.current);

        const chosen = pickRandom();
        setSelected(chosen);

        const index = threats.findIndex(
          (t) => t.threat_id === chosen.threat_id
        );

        const finalOffset = index * 80;
        setOffset(finalOffset);

        setIsRolling(false);
        setIsSlowing(false);
      }
    };

    slowToStop();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white p-6 rounded-2xl w-[420px] relative text-left">

        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-2">Randomize Threat</h2>
        <p className="text-sm text-gray-500 mb-4">
          Choose a category or select ALL to roll from every threat.
        </p>
        
        {/* Round settings */}
        <div className="mb-5 space-y-3">

          {/* Round timer */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Round Timer (minutes)
            </label>

            <input
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-20 border border-gray-300 rounded-md px-2 py-1 text-center
                focus:ring-2 focus:ring-[#2EE58A]"
            />
          </div>

          {/* Bonus */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              First Submit Bonus
            </label>

            <input
              type="number"
              min={0}
              value={bonus}
              onChange={(e) => setBonus(Number(e.target.value))}
              className="w-20 border border-gray-300 rounded-md px-2 py-1 text-center
                focus:ring-2 focus:ring-[#2EE58A]"
            />
          </div>

        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Threat Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#2EE58A]"
          >
            <option value="">-- Select Category --</option>
            <option value="ALL">All Threats</option>

            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* Randomizer */}
        <div className="relative h-[80px] mb-6 overflow-hidden rounded-xl border border-gray-300 bg-white shadow-inner">
          <div className="absolute top-0 left-0 w-full h-6 bg-gradient-to-b from-white to-transparent pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>

          <div
            className="reel transition-transform duration-300 ease-out"
            style={{
              transform: `translateY(-${offset}px)`,
            }}
          >
            {threats.concat(threats).map((t, i) => (
              <div
                key={i}
                className="h-[80px] flex items-center justify-center text-lg font-semibold text-gray-800"
                style={{
                  filter: isRolling || isSlowing ? "blur(2px)" : "none",
                }}
              >
                {t.description}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between mt-4">

          {!isRolling && !isSlowing && (
            <button
              onClick={startRoll}
              disabled={!selectedCategory}
              className="px-4 py-2 rounded-full bg-blue-300 hover:bg-blue-200 text-blue-800 text-sm font-semibold disabled:opacity-50"
            >
              {selected ? "Reroll" : "Roll"}
            </button>
          )}

          {isRolling && (
            <button
              onClick={stopRoll}
              className="px-4 py-2 rounded-full bg-red-300 hover:bg-red-200 text-red-800 text-sm font-semibold"
            >
              Stop
            </button>
          )}

          <button
            disabled={!selected || isRolling || isSlowing}
            onClick={() => {
              onSelectThreat({
                threat: selected,
                duration_minutes: durationMinutes,
                bonus,
              });

              setThreats((prev) =>
                prev.filter((t) => t.threat_id !== selected.threat_id)
              );

              setSelected(null);
            }}
            className="px-6 py-2 rounded-full bg-[#2EE58A] hover:bg-[#23c877] text-white text-sm font-semibold disabled:opacity-50"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
