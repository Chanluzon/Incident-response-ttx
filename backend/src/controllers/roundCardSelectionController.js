const RoundCardSelection = require("../models/RoundCardSelection");

exports.placeCard = async (req, res) => {
  try {
    console.log("ROUND CARD SELECTION:", req.body);

    const { round_id, group_id, card_id } = req.body;

    const selection = await RoundCardSelection.placeCard({
      round_id,
      group_id,
      card_id,
    });

    // always return success
    res.status(201).json(selection);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error placing card");
  }
};

exports.getSelectionsForRound = async (req, res) => {
  try {
    const selections = await RoundCardSelection.findByRound(req.params.roundId);
    res.json(selections);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching selections");
  }
};

exports.getSelectionsForRoundAndGroup = async (req, res) => {
  try {
    const { roundId, groupId } = req.params;
    const selections = await RoundCardSelection.findByRoundAndGroup(roundId, groupId);
    res.json(selections);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching group selections");
  }
};

exports.unplaceCard = async (req, res) => {
  try {
    const { round_id, group_id, card_id } = req.body;
    await RoundCardSelection.unplaceCard({ round_id, group_id, card_id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error unplacing card");
  }
};
