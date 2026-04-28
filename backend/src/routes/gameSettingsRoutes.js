const express = require("express");
const router = express.Router();
const controller = require("../controllers/gameSettingsController");

console.log("GameSettings routes loaded");

router.get("/test", (req, res) => {
  console.log("Test route hit");
  res.send("Game Settings route works!");
});

// Protected routes
router.post("/", controller.createSettings);
router.get("/:gameId", controller.getSettings);
router.put("/:gameId", controller.updateSettings);

module.exports = router;
