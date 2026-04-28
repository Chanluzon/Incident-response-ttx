const express = require("express");
const router = express.Router();
const moderatorController = require("../controllers/moderatorController");
const authMiddleware = require("../middleware/auth");

// test
router.get("/test", (req, res) => 
    res.send("Moderator route works!"));
// Public routes
router.post("/register", moderatorController.register);
router.post("/login", moderatorController.login);

// Protected routes (need JWT)
router.post("/card", authMiddleware, moderatorController.createCard);
router.post("/threat", authMiddleware, moderatorController.createThreat);
router.post("/category", authMiddleware, moderatorController.createCategory);
router.post("/game", authMiddleware, moderatorController.setupGame);
router.post("/game/assign-threat", authMiddleware, moderatorController.assignThreatToGame);
router.post("/threat/map-answer", authMiddleware, moderatorController.mapThreatAnswers);
router.put("/threat/update-points", authMiddleware, moderatorController.updateThreatAnswerPoints);

module.exports = router;
