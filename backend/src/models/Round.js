const pool = require("../config/db");

class Round {
  constructor({ round_id, round_number, status, game_id, game_threat_id, duration_minutes, is_started, is_evaluated, first_submit_bonus }) {
    this.round_id = round_id;
    this.round_number = round_number;
    this.status = status;
    this.game_id = game_id;
    this.game_threat_id = game_threat_id;
    this.duration_minutes = duration_minutes;
    this.is_started = is_started;
    this.is_evaluated = is_evaluated;
    this.first_submit_bonus = first_submit_bonus;
  }

  // Create a new round
  static async create({
    round_number,
    game_id,
    game_threat_id,
    duration_minutes = 15,
    first_submit_bonus = 0,
  }) {
    const result = await pool.query(
      `
      INSERT INTO round (
        round_number,
        status,
        is_started,
        game_id,
        game_threat_id,
        duration_minutes,
        first_submit_bonus
      )
      VALUES ($1, 'pending', FALSE, $2, $3, $4, $5)
      RETURNING *
      `,
      [round_number, game_id, game_threat_id, duration_minutes, first_submit_bonus]
    );

    return new Round(result.rows[0]);
  }

  // Find round by ID
  static async findById(roundId) {
    const result = await pool.query(
      `SELECT * FROM round WHERE round_id = $1`,
      [roundId]
    );
    if (result.rows.length === 0) return null;
    return new Round(result.rows[0]);
  }

  // Start round
  async startRound() {
    const result = await pool.query(
      `
      UPDATE round
      SET
        is_started = TRUE,
        status = 'active',
        started_at = NOW()
      WHERE round_id = $1
      RETURNING *;
      `,
      [this.round_id]
    );

    Object.assign(this, result.rows[0]);

    const gameUpdate = await pool.query(
      `
      UPDATE game
      SET status = 'active'
      WHERE game_id = $1
      RETURNING *;
      `,
      [this.game_id]
    );

    if (gameUpdate.rowCount === 0) {
      console.warn(
        `[WARN] startRound(): game not updated, game_id=${this.game_id}`
      );
    }

    return this;
  }

  // Restart round
  async restartRound() {
    const result = await pool.query(
      `
      UPDATE round
      SET
        status = 'active',
        is_started = TRUE,
        started_at = NOW(),
        ended_at = NULL
      WHERE round_id = $1
      RETURNING *;
      `,
      [this.round_id]
    );

    Object.assign(this, result.rows[0]);
    return this;
  }


  // Update timer
  async updateDuration(duration_minutes) {
    const result = await pool.query(
      `UPDATE round
      SET duration_minutes = $1
      WHERE round_id = $2
      RETURNING *`,
      [duration_minutes, this.round_id]
    );

    Object.assign(this, result.rows[0]);
    return this;
  }

  static async findByGame(gameId) {
    const result = await pool.query(
      `
      SELECT
        r.round_id,
        r.round_number,
        r.status,
        r.is_started,
        r.duration_minutes,
        r.game_id,
        r.game_threat_id,
        r.started_at,
        t.description AS threat_description,
        GREATEST(
          0,
          (r.duration_minutes * 60)
          - EXTRACT(EPOCH FROM (NOW() - r.started_at))
        )::INT AS remaining_seconds
      FROM round r
      JOIN game_threat gt ON r.game_threat_id = gt.game_threat_id
      JOIN threat t ON gt.threat_id = t.threat_id
      WHERE r.game_id = $1
      ORDER BY r.round_number
      `,
      [gameId]
    );

    return result.rows;
  }

  // End round
  async endRound() {
    const result = await pool.query(
      `UPDATE round
      SET status = 'ended',
          is_started = FALSE,
          ended_at = NOW()
      WHERE round_id = $1
      RETURNING *`,
      [this.round_id]
    );

    await pool.query(
      `UPDATE game
      SET status = 'pending'
      WHERE game_id = $1
        AND NOT EXISTS (
          SELECT 1 FROM round
          WHERE game_id = $1 AND is_started = TRUE
        )`,
      [this.game_id]
    );

    Object.assign(this, result.rows[0]);
    return this;
  }

  static async autoEndExpiredRounds(gameId) {
    await pool.query(
      `
      UPDATE round
      SET status = 'ended',
          is_started = FALSE,
          ended_at = NOW()
      WHERE game_id = $1
        AND is_started = TRUE
        AND started_at IS NOT NULL
        AND NOW() > started_at + (duration_minutes * INTERVAL '1 minute')
      `,
      [gameId]
    );
  }
  
}

module.exports = Round;
