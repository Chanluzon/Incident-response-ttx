const GameSettings = require("../models/GameSettings");

// Create new settings
exports.createSettings = async (req, res) => {
  try {
    const { game_id, budget, card_reuse_limit } = req.body;
    const settings = await GameSettings.create({ game_id, budget, card_reuse_limit });
    res.status(201).json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create game settings" });
  }
};

// Get settings for a game
exports.getSettings = async (req, res) => {
  try {
    const { gameId } = req.params;
    const settings = await GameSettings.findByGameId(gameId);
    if (!settings) return res.status(404).json({ error: "Settings not found" });
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
};

// Update settings for a game
exports.updateSettings = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { budget, card_reuse_limit } = req.body;

    const updated = await GameSettings.update(gameId, { budget, card_reuse_limit });
    if (!updated) return res.status(404).json({ error: "Settings not found" });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update settings" });
  }
};
