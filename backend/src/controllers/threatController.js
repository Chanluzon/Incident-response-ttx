const Threat = require("../models/Threat");

exports.createThreat = async (req, res) => {
  try {
    const { description, created_by } = req.body;
    const threat = await Threat.create({ description, created_by });
    res.status(201).json(threat);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating threat");
  }
};

exports.getThreat = async (req, res) => {
  try {
    const threat = await Threat.findById(req.params.id);
    if (!threat) return res.status(404).send("Threat not found");
    res.json(threat);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching threat");
  }
};

exports.getAllThreats = async (req, res) => {
  try {
    const threats = await Threat.findAll();
    res.json(threats);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching threats");
  }
};

exports.updateThreat = async (req, res) => {
  try {
    const threat = await Threat.findById(req.params.id);
    if (!threat) return res.status(404).send("Threat not found");

    const updated = await threat.defineThreat(req.body.description);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating threat");
  }
};

exports.deleteThreat = async (req, res) => {
  try {
    const threat = await Threat.findById(req.params.id);
    if (!threat) return res.status(404).send("Threat not found");

    await Threat.delete(req.params.id);

    res.json({ message: "Threat deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting threat");
  }
};


exports.linkCards = async (req, res) => {
  try {
    const threat = await Threat.findById(req.params.id);
    if (!threat) return res.status(404).send("Threat not found");

    const { card_ids } = req.body; // expecting array
    const result = await threat.linkToCards(card_ids);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error linking cards");
  }
};
