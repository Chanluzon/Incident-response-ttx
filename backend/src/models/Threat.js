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
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Delete basic associations
      await client.query(`DELETE FROM threat_category WHERE threat_id = $1`, [id]);
      await client.query(`DELETE FROM threat_answer WHERE threat_id = $1`, [id]);

      // 2. Handle deep dependencies through game_threat
      const gameThreats = await client.query(
        `SELECT game_threat_id FROM game_threat WHERE threat_id = $1`,
        [id]
      );
      const gameThreatIds = gameThreats.rows.map((row) => row.game_threat_id);

      if (gameThreatIds.length > 0) {
        const rounds = await client.query(
          `SELECT round_id FROM round WHERE game_threat_id = ANY($1)`,
          [gameThreatIds]
        );
        const roundIds = rounds.rows.map((row) => row.round_id);

        if (roundIds.length > 0) {
          // Delete all records dependent on these rounds
          await client.query(
            `DELETE FROM round_card_selection WHERE round_id = ANY($1)`,
            [roundIds]
          );
          await client.query(
            `DELETE FROM round_submission WHERE round_id = ANY($1)`,
            [roundIds]
          );
          await client.query(
            `DELETE FROM score WHERE round_id = ANY($1)`,
            [roundIds]
          );

          // Delete the rounds themselves
          await client.query(
            `DELETE FROM round WHERE round_id = ANY($1)`,
            [roundIds]
          );
        }

        // Delete the game_threat associations
        await client.query(`DELETE FROM game_threat WHERE threat_id = $1`, [id]);
      }

      // 3. Delete the threat itself
      const result = await client.query(`DELETE FROM threat WHERE threat_id = $1`, [id]);

      await client.query("COMMIT");
      return result.rowCount > 0;
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("DELETE THREAT ERROR:", err);
      throw err;
    } finally {
      client.release();
    }
  }


  // Placeholder for linking cards to a threat
  async linkToCards(cardIds = []) {
    console.log(`Threat ${this.threat_id} linked to cards:`, cardIds);
    return { threat_id: this.threat_id, linked_cards: cardIds };
  }
}

module.exports = Threat;
