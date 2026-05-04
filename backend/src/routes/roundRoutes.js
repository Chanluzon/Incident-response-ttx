const express = require("express");
const router = express.Router();
const roundController = require("../controllers/roundController");

// test
router.get("/test", (req, res) => 
    res.send("Round route works!"));

// Create round
router.post("/", roundController.createRound);

// Start round
router.put("/:id/start", roundController.startRound);

// Restart round
router.put("/:id/restart", roundController.restartRound);

// Update round timer
router.put("/:id/timer", roundController.updateRoundTimer);

// End round
router.put("/:id/end", roundController.endRound);

// Submit answers
router.post("/:id/submit", roundController.submitAnswers);

// Check if group submitted
router.get("/:id/submission/:group_id", roundController.checkSubmission);

// Finalize answers
router.post("/:id/finalize", roundController.finalizeRound);

module.exports = router;
