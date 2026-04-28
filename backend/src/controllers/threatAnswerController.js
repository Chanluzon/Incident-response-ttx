const ThreatAnswer = require("../models/ThreatAnswer");

// Add threat answer
exports.addThreatAnswer = async (req, res) => {
  try {
    const { threat_id, card_id, answer_type, points } = req.body;
    const relation = await ThreatAnswer.create({ threat_id, card_id, answer_type, points });
    res.status(201).json(relation);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding threat answer");
  }
};

exports.validateAnswer = async (req, res) => {
  try {
    const { threat_id, card_id } = req.body;
    const validation = await ThreatAnswer.validateAnswer(threat_id, card_id);
    res.json(validation);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error validating answer");
  }
};

exports.getThreatAnswers = async (req, res) => {
  try {
    const { threat_id } = req.params;

    if (!threat_id || isNaN(Number(threat_id))) {
      return res.status(400).json({ error: "Invalid threat_id" });
    }

    const answers = await ThreatAnswer.findAnswersByThreat(threat_id);

    if (answers.length === 0) {
      return res.json({
        threat_id,
        threatDescription: null,
        totalAnswers: 0,
        answers: []
      });
    }

    const { threat_description } = answers[0];

    res.json({
      threat_id,
      threatDescription: threat_description,
      totalAnswers: answers.length,
      answers: answers.map(a => ({
        card_id: a.card_id,
        card_name: a.card_name,
        answer_type: a.answer_type,
        points: a.points
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch threat answers" });
  }
};

// Update threat answer
exports.updateThreatAnswer = async (req, res) => {
  try {
    const { threat_id, card_id, answer_type, points } = req.body;

    const updated = await ThreatAnswer.update(
      threat_id,
      card_id,
      answer_type,
      points
    );

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating threat answer" });
  }
};

// Delete threat answer
exports.deleteThreatAnswer = async (req, res) => {
  try {
    const {threat_id, card_id} = req.params;
    const deleted = await ThreatAnswer.delete(threat_id, card_id);
    res.json({ message : "Threat answer deleted successfully.", deleted});
  } catch (err) {
    console.error(err);
    res.status(500).json({error:err.message});
  }
};


