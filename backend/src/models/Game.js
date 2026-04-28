const pool = require("../config/db");

function generateGameCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; 
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

class Game {
  constructor({ game_id, game_name, game_type, status, game_code }) {
    this.game_id = game_id;
    this.game_name = game_name;
    this.game_type = game_type;
    this.status = status;
    this.game_code = game_code;
  }

  // create game
  static async create({ game_name, game_type }) {
    let gameCode;
    let exists = true;

    // ensure uniqueness
    while (exists) {
      gameCode = generateGameCode();
      const check = await pool.query(
        "SELECT 1 FROM game WHERE game_code = $1",
        [gameCode]
      );
      exists = check.rows.length > 0;
    }

    const result = await pool.query(
      `INSERT INTO game (game_name, game_type, status, game_code)
      VALUES ($1, $2, 'pending', $3)
      RETURNING *`,
      [game_name, game_type, gameCode]
    );

    return new Game(result.rows[0]);
  }

  // find game by code
  static async findByCode(gameCode) {
    const result = await pool.query(
      `SELECT * FROM game WHERE game_code = $1`,
      [gameCode]
    );

    if (result.rows.length === 0) return null;
    return new Game(result.rows[0]);
  }

  // fetch game by id
  static async findById(gameId) {
    const result = await pool.query(
      `SELECT * FROM game WHERE game_id = $1`,
      [gameId]
    );

    if (result.rows.length === 0) return null;
    return new Game(result.rows[0]);
  }

  // delete a game
  static async delete(gameId) {
    const result = await pool.query(
      `DELETE FROM game WHERE game_id = $1 RETURNING *`,
      [gameId]
    );

    return result.rows[0];
  }

  // add a round
  async addRound(roundNumber) {
    const result = await pool.query(
      `INSERT INTO rounds (game_id, round_number)
       VALUES ($1, $2) RETURNING *`,
      [this.game_id, roundNumber]
    );

    return result.rows[0];
  }
}

module.exports = Game;
