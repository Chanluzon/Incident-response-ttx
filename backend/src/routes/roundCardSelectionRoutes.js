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

module.exports = router;
