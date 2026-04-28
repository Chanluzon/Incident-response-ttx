const CardUsage = require("../models/CardUsage");

exports.createCardUsage = async (req, res) => {
  try {
    const { group_id, card_id, game_id } = req.body;
    const existing = await CardUsage.findUsage(group_id, card_id, game_id);
    if (existing) return res.json(existing);

    const usage = await CardUsage.create({ group_id, card_id, game_id });
    res.status(201).json(usage);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating card usage");
  }
};

exports.incrementUsage = async (req, res) => {
  try {
    const { group_id, card_id, game_id } = req.body;
    const usage = await CardUsage.findUsage(group_id, card_id, game_id);
    if (!usage) return res.status(404).send("Card usage record not found");

    const updated = await usage.incrementUsage();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error incrementing usage");
  }
};

exports.checkLimit = async (req, res) => {
  try {
    const { group_id, card_id, game_id } = req.body;
    const result = await CardUsage.checkLimit(group_id, card_id, game_id);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error checking usage limit");
  }
};
