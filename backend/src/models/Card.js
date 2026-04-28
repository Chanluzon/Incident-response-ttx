const pool = require("../config/db");

class Card {
  constructor({ card_id, card_name, category, description, moderator_id }) {
    this.card_id = card_id;
    this.card_name = card_name;
    this.category = category;
    this.description = description;
    this.moderator_id = moderator_id;
  }

  // Create a new card
  static async create({ card_name, category, description, moderator_id }) {
    const result = await pool.query(
      `INSERT INTO card (card_name, category, description, moderator_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [card_name, category, description, moderator_id]
    );
    return new Card(result.rows[0]);
  }

  // Find by ID
  static async findById(id) {
    const result = await pool.query(
      `SELECT * FROM card WHERE card_id = $1`,
      [id]
    );
    if (result.rows.length === 0) return null;
    return new Card(result.rows[0]);
  }

  // Find all cards
  static async findAll() {
    const result = await pool.query(`SELECT * FROM card`);
    return result.rows.map(row => new Card(row));
  }

    // Update a card
  static async update(id, { card_name, category, description }) {
    const result = await pool.query(
      `UPDATE card
       SET card_name = COALESCE($1, card_name),
           category = COALESCE($2, category),
           description = COALESCE($3, description)
       WHERE card_id = $4
       RETURNING *`,
      [card_name, category, description, id]
    );

    if (result.rows.length === 0) return null;
    return new Card(result.rows[0]);
  }

  // Delete a card
  static async delete(id) {
    const result = await pool.query(`DELETE FROM card WHERE card_id = $1 RETURNING *`, [id]);
    return result.rows.length > 0;
  }

  // Get category
  getCategory() {
    return this.category;
  }

  // Assign card to a threat
  async assignToThreat(threat_id) {
    const result = await pool.query(
      `INSERT INTO threat_answer (threat_id, card_id)
       VALUES ($1, $2)
       RETURNING *`,
      [threat_id, this.card_id]
    );
    return result.rows[0];
  }
}

module.exports = Card;
