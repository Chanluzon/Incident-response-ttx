const pool = require("../config/db");

class RoundCardSelection {
  constructor({ selection_id, placed_at, round_id, group_id, card_id }) {
    this.selection_id = selection_id;
    this.placed_at = placed_at;
    this.round_id = round_id;
    this.group_id = group_id;
    this.card_id = card_id;
  }

  // Place a card in a round
  static async placeCard({ round_id, group_id, card_id }) {
    const result = await pool.query(
      `
      INSERT INTO round_card_selection (round_id, group_id, card_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (round_id, group_id, card_id)
      DO NOTHING
      RETURNING *
      `,
      [round_id, group_id, card_id]
    );

    return result.rows[0] || { round_id, group_id, card_id };
  }

  // Validate if this selection is allowed
  static async validateSelection(round_id, group_id, card_id) {
    const result = await pool.query(
      `SELECT * FROM round_card_selection 
       WHERE round_id = $1 AND group_id = $2 AND card_id = $3`,
      [round_id, group_id, card_id]
    );
    return result.rows.length === 0;
  }

  // Get all selections for a round
  static async findByRound(round_id) {
    const result = await pool.query(
      `SELECT * FROM round_card_selection WHERE round_id = $1`,
      [round_id]
    );
    return result.rows.map(row => new RoundCardSelection(row));
  }
}

module.exports = RoundCardSelection;
