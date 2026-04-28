const express = require("express");
const router = express.Router();
const threatCategoryController = require("../controllers/threatCategoryController");

// test
router.get("/test", (req, res) => 
    res.send("Threat Category route works!"));

// Assign threat to category
router.post("/", threatCategoryController.assignThreatToCategory);

// Get categories linked to a threat
router.get("/threat/:threatId", threatCategoryController.getCategoriesForThreat);

// Get threats linked to a category
router.get("/category/:categoryId", threatCategoryController.getThreatsForCategory);

router.post("/assign", threatCategoryController.assignThreatToCategory);

router.delete("/unassign", threatCategoryController.unassignThreatFromCategory);

module.exports = router;
