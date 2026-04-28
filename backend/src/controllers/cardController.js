const Card = require("../models/Card");

exports.createCard = async (req, res) => {
  try {
    const { card_name, category, description, moderator_id } = req.body;
    const card = await Card.create({ card_name, category, description, moderator_id });
    res.status(201).json(card);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating card");
  }
};

exports.getCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).send("Card not found");
    res.json(card);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching card");
  }
};

exports.getAllCards = async (req, res) => {
  try {
    const cards = await Card.findAll();
    res.json(cards);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching cards");
  }
};

exports.updateCard = async (req, res) => {
  try {
    const { card_name, category, description } = req.body;
    const updatedCard = await Card.update(req.params.id, { card_name, category, description });

    if (!updatedCard) {
      return res.status(404).json({ error: "Card not found" });
    }

    res.json(updatedCard);
  } catch (err) {
    console.error("Error updating card:", err);
    res.status(500).json({ error: "Error updating card" });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    const success = await Card.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Card not found" });
    }
    res.json({ message: "Card deleted successfully" });
  } catch (err) {
    console.error("Error deleting card:", err);
    res.status(500).json({ error: "Error deleting card" });
  }
};

exports.assignToThreat = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).send("Card not found");

    const { threat_id } = req.body;
    const result = await card.assignToThreat(threat_id);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error assigning card to threat");
  }
};
