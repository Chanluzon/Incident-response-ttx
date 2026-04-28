const pool = require("../config/db");

class Category {
  constructor({ category_id, category_name, created_by }) {
    this.category_id = category_id;
    this.category_name = category_name;
    this.created_by = created_by;
  }

  // Create a new category
  static async create({ category_name, created_by }) {
    const result = await pool.query(
      `INSERT INTO category (category_name, created_by)
       VALUES ($1, $2)
       RETURNING *`,
      [category_name, created_by]
    );
    return new Category(result.rows[0]);
  }

  // Find category by ID
  static async findById(id) {
    const result = await pool.query(
      `SELECT * FROM category WHERE category_id = $1`,
      [id]
    );
    if (result.rows.length === 0) return null;
    return new Category(result.rows[0]);
  }

  // Get all categories
  static async findAll() {
    const result = await pool.query(`SELECT * FROM category`);
    return result.rows.map(row => new Category(row));
  }

  // Define/update category name
  async defineCategory(newName) {
    const result = await pool.query(
      `UPDATE category
       SET category_name = $1
       WHERE category_id = $2
       RETURNING *`,
      [newName, this.category_id]
    );
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Delete category by ID (with cascade cleanup)
  static async delete(id) {
    // Delete related records first to avoid foreign key violations
    await pool.query(`DELETE FROM threat_category WHERE category_id = $1`, [id]);
    
    // Now delete the category itself
    await pool.query(`DELETE FROM category WHERE category_id = $1`, [id]);
    return true;
  }
}

module.exports = Category;
