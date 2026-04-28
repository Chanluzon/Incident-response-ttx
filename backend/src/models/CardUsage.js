const pool = require("../config/db");

class CardUsage {
  constructor({ usage_id, group_id, card_id, game_id, times_used }) {
    this.usage_id = usage_id;
    this.group_id = group_id;
    this.card_id = card_id;
    this.game_id = game_id;
    this.times_used = times_used;
  }

  // Create a record (first usage of a card by a group in a game)
  static async create({ group_id, card_id, game_id }) {
    const result = await pool.query(
      `INSERT INTO card_usage (group_id, card_id, game_id, times_used)
       VALUES ($1, $2, $3, 0)
       RETURNING *`,
      [group_id, card_id, game_id]
    );
    return new CardUsage(result.rows[0]);
  }

  // Find usage by IDs
  static async findUsage(group_id, card_id, game_id) {
    const result = await pool.query(
      `SELECT * FROM card_usage 
       WHERE group_id = $1 AND card_id = $2 AND game_id = $3`,
      [group_id, card_id, game_id]
    );
    if (result.rows.length === 0) return null;
    return new CardUsage(result.rows[0]);
  }

  // Increment usage count
  async incrementUsage() {
    const result = await pool.query(
      `UPDATE card_usage
       SET times_used = times_used + 1
       WHERE usage_id = $1
       RETURNING *`,
      [this.usage_id]
    );
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Check usage limit (compare with game_settings)
  static async checkLimit(group_id, card_id, game_id) {
    const result = await pool.query(
      `SELECT cu.times_used, gs.card_reuse_limit
       FROM card_usage cu
       JOIN game_settings gs ON cu.game_id = gs.game_id
       WHERE cu.group_id = $1 AND cu.card_id = $2 AND cu.game_id = $3`,
      [group_id, card_id, game_id]
    );

    if (result.rows.length === 0) return { allowed: true, times_used: 0 };

    const { times_used, card_reuse_limit } = result.rows[0];
    return { allowed: times_used < card_reuse_limit, times_used };
  }
}

module.exports = CardUsage;
