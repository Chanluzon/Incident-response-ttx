const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const ThreatCategory = require("../models/ThreatCategory");

// test
router.get("/test", (req, res) => 
    res.send("Category route works!"));

// create category
router.post("/", categoryController.createCategory);

// load threats under a category
router.get("/:id/threats", async (req, res) => {
  try {
    const result = await ThreatCategory.findThreatsByCategory(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).send("Error loading category threats");
  }
});

// get single category
router.get("/:id", categoryController.getCategory);

// get all categories
router.get("/", categoryController.getAllCategories);

// update category
router.put("/:id", categoryController.updateCategory);

// delete category
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
