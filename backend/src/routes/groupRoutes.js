const express = require("express");
const router = express.Router();
const controller = require("../controllers/groupController");

console.log("Group routes loaded");

// test
router.get("/test", (req, res) => 
    res.send("Group route works!"));

// CRUD
router.post("/", controller.createGroup);
router.get("/", controller.listGroups);
router.get("/:groupId", controller.getGroup);
router.put("/:groupId", controller.updateGroup);
router.delete("/:groupId", controller.deleteGroup);

// Domain actions
router.post("/:groupId/join-game", controller.joinGame);
router.post("/:groupId/selections", controller.submitSelection);

module.exports = router;
