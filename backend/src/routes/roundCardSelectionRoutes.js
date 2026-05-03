const express = require("express");
const router = express.Router();
const roundCardSelectionController = require("../controllers/roundCardSelectionController");

// test
router.get("/test", (req, res) => 
    res.send("Round Card chuchu route works!"));

// Place a card in a round
router.post("/", roundCardSelectionController.placeCard);

// Get all selections for a round
router.get("/round/:roundId", roundCardSelectionController.getSelectionsForRound);

// Get selections for round and group
router.get("/round/:roundId/group/:groupId", roundCardSelectionController.getSelectionsForRoundAndGroup);

// Remove a card from a round
router.delete("/unplace", roundCardSelectionController.unplaceCard);

module.exports = router;
