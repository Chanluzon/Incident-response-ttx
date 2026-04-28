const pool = require("../config/db");

class GameThreat {
  constructor({ game_threat_id, game_id, threat_id, order_num, is_active }) {
    this.game_threat_id = game_threat_id;
    this.game_id = game_id;
    this.threat_id = threat_id;
    this.order_num = order_num;
    this.is_active = is_active;
  }

  // Create a new GameThreat
  static async create({ game_id, threat_id, order_num }) {
    const result = await pool.query(
      `INSERT INTO game_threat (game_id, threat_id, order_num, is_active)
       VALUES ($1, $2, $3, false)
       RETURNING *`,
      [game_id, threat_id, order_num]
    );
    return new GameThreat(result.rows[0]);
  }

  // Find by ID
  static async findById(id) {
    const result = await pool.query(
      `SELECT * FROM game_threat WHERE game_threat_id = $1`,
      [id]
    );
    if (result.rows.length === 0) return null;
    return new GameThreat(result.rows[0]);
  }

  // Activate threat
  async activateThreat() {
    const result = await pool.query(
      `UPDATE game_threat
       SET is_active = true
       WHERE game_threat_id = $1
       RETURNING *`,
      [this.game_threat_id]
    );
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Deactivate threat
  async deactivateThreat() {
    const result = await pool.query(
      `UPDATE game_threat
       SET is_active = false
       WHERE game_threat_id = $1
       RETURNING *`,
      [this.game_threat_id]
    );
    Object.assign(this, result.rows[0]);
    return this;
  }
}

module.exports = GameThreat;
