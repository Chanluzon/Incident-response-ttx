const ThreatCategory = require("../models/ThreatCategory");

exports.assignThreatToCategory = async (req, res) => {
  try {
    const { category_id, threat_id } = req.body;
    const relation = await ThreatCategory.assignThreatToCategory({ category_id, threat_id });
    res.status(201).json(relation);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error assigning threat to category");
  }
};

exports.getCategoriesForThreat = async (req, res) => {
  try {
    const categories = await ThreatCategory.findCategoriesByThreat(req.params.threatId);
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching categories for threat");
  }
};

exports.getThreatsForCategory = async (req, res) => {
  try {
    const threats = await ThreatCategory.findThreatsByCategory(req.params.categoryId);
    res.json(threats);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching threats for category");
  }
};

exports.unassignThreatFromCategory = async (req, res) => {
  try {
    const { category_id, threat_id } = req.body;

    const result = await ThreatCategory.removeThreatFromCategory({
      category_id,
      threat_id,
    });

    res.json({ success: true, removed: result });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error unassigning threat from category");
  }
};

