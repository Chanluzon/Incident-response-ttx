const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
  try {
    const { category_name, created_by } = req.body;
    const category = await Category.create({ category_name, created_by });
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating category");
  }
};

exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).send("Category not found");
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching category");
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching categories");
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).send("Category not found");

    const updated = await category.defineCategory(req.body.category_name);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating category");
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).send("Category not found");

    await Category.delete(req.params.id);
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting category");
  }
};
