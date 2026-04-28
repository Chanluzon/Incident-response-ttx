const pool = require("../config/db");

class Threat {
  constructor({ threat_id, description, created_by, category_id }) {
    this.threat_id = threat_id;
    this.description = description;
    this.created_by = created_by;
    this.category_id = category_id;
  }

  // Create new threat
  static async create({ description, created_by }) {
    const result = await pool.query(
      `INSERT INTO threat (description, created_by)
       VALUES ($1, $2)
       RETURNING *`,
      [description, created_by]
    );
    return new Threat(result.rows[0]);
  }

  // Find threat by ID
  static async findById(id) {
    const result = await pool.query(
      `SELECT * FROM threat WHERE threat_id = $1`,
      [id]
    );
    if (result.rows.length === 0) return null;
    return new Threat(result.rows[0]);
  }

  // Find all threats
  static async findAll() {
    const result = await pool.query(`
      SELECT t.*, tc.category_id
      FROM threat t
      LEFT JOIN threat_category tc ON t.threat_id = tc.threat_id
    `);

    return result.rows.map(row => new Threat(row));
  }

  // Update description
  async defineThreat(newDescription) {
    const result = await pool.query(
      `UPDATE threat
       SET description = $1
       WHERE threat_id = $2
       RETURNING *`,
      [newDescription, this.threat_id]
    );
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Delete threat by ID (with cascade cleanup)
  static async delete(id) {
    // Delete related records first to avoid foreign key violations
    await pool.query(`DELETE FROM threat_category WHERE threat_id = $1`, [id]);
    await pool.query(`DELETE FROM threat_answer WHERE threat_id = $1`, [id]);
    await pool.query(`DELETE FROM game_threat WHERE threat_id = $1`, [id]);
    
    // Now delete the threat itself
    await pool.query(`DELETE FROM threat WHERE threat_id = $1`, [id]);
    return true;
  }


  // Placeholder for linking cards to a threat
  async linkToCards(cardIds = []) {
    console.log(`Threat ${this.threat_id} linked to cards:`, cardIds);
    return { threat_id: this.threat_id, linked_cards: cardIds };
  }
}

module.exports = Threat;
