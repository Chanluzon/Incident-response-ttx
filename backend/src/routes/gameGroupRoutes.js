const express = require("express");
const router = express.Router();
const controller = require("../controllers/gameGroupController");

router.get("/test", (req, res) =>
  res.send("Game Group route works!")
);

router.post("/join", controller.joinGameByCode);

// GET groups in a game
router.get("/:id/groups", controller.getGroupsInGame);

module.exports = router;
