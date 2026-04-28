const pool = require("../config/db");

class GameGroup {
  // join group to a game
  static async joinGame(game_id, group_id) {
    // prevent duplicate join
    const exists = await pool.query(
      `SELECT 1 FROM game_group 
       WHERE game_id = $1 AND group_id = $2`,
      [game_id, group_id]
    );

    if (exists.rows.length > 0) {
      throw new Error("Group already joined this game");
    }

    const result = await pool.query(
      `INSERT INTO game_group (game_id, group_id, joined_at)
       VALUES ($1, $2, NOW())
       RETURNING *`,
      [game_id, group_id]
    );

    return result.rows[0];
  }

  // get all groups
  static async getGroupsByGame(game_id) {
    const result = await pool.query(
      `SELECT 
        g.group_id,
        g.group_name,
        g.leader_name,
        gg.joined_at
      FROM game_group gg
      JOIN groups g ON g.group_id = gg.group_id
      WHERE gg.game_id = $1
      ORDER BY gg.joined_at ASC`,
      [game_id]
    );

    return result.rows;
  }

  // check if group already joined
  static async hasJoined(game_id, group_id) {
    const result = await pool.query(
      `SELECT 1 FROM game_group 
       WHERE game_id = $1 AND group_id = $2`,
      [game_id, group_id]
    );

    return result.rows.length > 0;
  }
}

module.exports = GameGroup;
