const express = require("express");
const router = express.Router();
const scoreController = require("../controllers/scoreController");

// test
router.get("/test", (req, res) => 
    res.send("Score route works!"));

// Get leaderboard
router.get("/leaderboard/:gameId", scoreController.getLeaderboard);

// Get breakdown
router.get("/breakdown/:gameId", scoreController.getRoundBreakdown);

// Get score by group and round
router.get("/:group_id/:round_id", scoreController.getScore);

module.exports = router;
