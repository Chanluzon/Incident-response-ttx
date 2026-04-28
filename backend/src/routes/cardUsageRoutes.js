const express = require("express");
const router = express.Router();
const cardUsageController = require("../controllers/cardUsageController");

// test
router.get("/test", (req, res) => 
    res.send("Card Usage route works!"));

// Create a usage record
router.post("/", cardUsageController.createCardUsage);

// Increment usage
router.put("/increment", cardUsageController.incrementUsage);

// Check usage limit
router.post("/check", cardUsageController.checkLimit);

module.exports = router;
