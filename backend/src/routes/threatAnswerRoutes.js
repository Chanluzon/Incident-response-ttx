const express = require("express");
const router = express.Router();
const threatAnswerController = require("../controllers/threatAnswerController");

// test
router.get("/test", (req, res) => 
    res.send("Threat Answer route works!"));

// Add a card as a correct answer to a threat
router.post("/", threatAnswerController.addThreatAnswer);

// Validate if a card is a correct answer for a threat
router.post("/validate", threatAnswerController.validateAnswer);

// Update threat answers
router.put("/", threatAnswerController.updateThreatAnswer);

// Get all correct answers (cards) for a threat
router.get("/threat/:threat_id/answers", threatAnswerController.getThreatAnswers);

// Delete threat answer
router.delete("/:threat_id/:card_id", threatAnswerController.deleteThreatAnswer);

module.exports = router;
