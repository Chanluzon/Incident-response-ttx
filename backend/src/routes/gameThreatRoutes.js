const express = require("express");
const router = express.Router();
const gameThreatController = require("../controllers/gameThreatController");

// test
router.get("/test", (req, res) => 
    res.send("Game Threat route works!"));

// Create game threat
router.post("/", gameThreatController.createGameThreat);

// Activate threat
router.put("/:id/activate", gameThreatController.activateThreat);

// Deactivate threat
router.put("/:id/deactivate", gameThreatController.deactivateThreat);

module.exports = router;
