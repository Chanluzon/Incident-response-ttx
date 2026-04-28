const pool = require("../config/db");

class ThreatCategory {
  constructor({ category_id, threat_id }) {
    this.category_id = category_id;
    this.threat_id = threat_id;
  }

  // Assign a threat to a category
  static async assignThreatToCategory({ category_id, threat_id }) {
    const result = await pool.query(
      `INSERT INTO threat_category(category_id, threat_id)
       VALUES ($1, $2)
       RETURNING *`,
      [category_id, threat_id]
    );
    return new ThreatCategory(result.rows[0]);
  }

  // Find all categories for a threat
  static async findCategoriesByThreat(threat_id) {
    const result = await pool.query(
      `SELECT c.* 
       FROM category c
       JOIN threat_category tc ON c.category_id = tc.category_id
       WHERE tc.threat_id = $1`,
      [threat_id]
    );
    return result.rows;
  }

  // Find all threats for a category
  static async findThreatsByCategory(category_id) {
    const result = await pool.query(
      `SELECT t.* 
       FROM threat t
       JOIN threat_category tc ON t.threat_id = tc.threat_id
       WHERE tc.category_id = $1`,
      [category_id]
    );
    return result.rows;
  }

  static async removeThreatFromCategory({ category_id, threat_id }) {
    const result = await pool.query(
      `DELETE FROM threat_category
      WHERE category_id = $1 AND threat_id = $2
      RETURNING *`,
      [category_id, threat_id]
    );

    return result.rows[0];
  }
}


module.exports = ThreatCategory;
