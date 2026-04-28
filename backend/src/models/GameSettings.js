const pool = require("../config/db");

class GameSettings {
  constructor(setting_id, game_id, budget, card_reuse_limit) {
    this.setting_id = setting_id;
    this.game_id = game_id;
    this.budget = budget;
    this.card_reuse_limit = card_reuse_limit;
  }

  // Create new settings
  static async create({ game_id, budget, card_reuse_limit }) {
    const result = await pool.query(
      `INSERT INTO game_settings (game_id, budget, card_reuse_limit)
       VALUES ($1, $2, $3) RETURNING *`,
      [game_id, budget, card_reuse_limit]
    );
    return new GameSettings(...Object.values(result.rows[0]));
  }

  // Find settings by game_id
  static async findByGameId(game_id) {
    const result = await pool.query(
      `SELECT * FROM game_settings WHERE game_id = $1`,
      [game_id]
    );
    if (result.rows.length === 0) return null;
    return new GameSettings(...Object.values(result.rows[0]));
  }

  // Update settings
  static async update(game_id, { budget, card_reuse_limit }) {
    const result = await pool.query(
      `UPDATE game_settings
       SET budget = $1, card_reuse_limit = $2
       WHERE game_id = $3
       RETURNING *`,
      [budget, card_reuse_limit, game_id]
    );
    if (result.rows.length === 0) return null;
    return new GameSettings(...Object.values(result.rows[0]));
  }

  // Logic helpers
  validateCardUsage(timesUsed) {
    return timesUsed <= this.card_reuse_limit;
  }

  checkBudget(cardCost) {
    return cardCost <= this.budget;
  }
}

module.exports = GameSettings;
