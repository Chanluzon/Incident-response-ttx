const pool = require("../config/db");

class Score {
  constructor({ score_id, total_points, group_id, round_id, bonus_points, base_points }) {
    this.score_id = score_id;
    this.total_points = total_points;
    this.group_id = group_id;
    this.round_id = round_id;
    this.bonus_points = bonus_points;
    this.base_points = base_points;
  }

  // Create a score record
  static async create({
    group_id,
    round_id,
    base_points = 0,
    bonus_points = 0,
    total_points = 0,
  }) {
    const result = await pool.query(
      `INSERT INTO score (group_id, round_id, base_points, bonus_points, total_points)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [group_id, round_id, base_points, bonus_points, total_points]
    );
    return new Score(result.rows[0]);
  }

  // Find score by group & round
  static async find(group_id, round_id) {
    const result = await pool.query(
      `SELECT * FROM score WHERE group_id = $1 AND round_id = $2`,
      [group_id, round_id]
    );
    if (result.rows.length === 0) return null;
    return new Score(result.rows[0]);
  }

  // Update score (add points)
  async updateScore(points) {
    const result = await pool.query(
      `UPDATE score
       SET
        base_points = base_points + $1,
        total_points = base_points + bonus_points
       WHERE score_id = $2
       RETURNING *`,
      [points, this.score_id]
    );
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Get score value
  getScore() {
    return this.total_points;
  }
}

module.exports = Score;
