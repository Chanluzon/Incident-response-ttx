const GameThreat = require("../models/GameThreat");

exports.createGameThreat = async (req, res) => {
  try {
    const { game_id, threat_id, order_num } = req.body;
    const gameThreat = await GameThreat.create({ game_id, threat_id, order_num });
    res.status(201).json(gameThreat);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating game threat");
  }
};

exports.activateThreat = async (req, res) => {
  try {
    const gameThreat = await GameThreat.findById(req.params.id);
    if (!gameThreat) return res.status(404).send("Game threat not found");

    const updated = await gameThreat.activateThreat();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error activating threat");
  }
};

exports.deactivateThreat = async (req, res) => {
  try {
    const gameThreat = await GameThreat.findById(req.params.id);
    if (!gameThreat) return res.status(404).send("Game threat not found");

    const updated = await gameThreat.deactivateThreat();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deactivating threat");
  }
};
