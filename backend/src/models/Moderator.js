const pool = require("../config/db");
const ThreatAnswer = require("./ThreatAnswer");

class Moderator {
  constructor(moderator_id, name, email, password) {
    this.moderator_id = moderator_id;
    this.name = name;
    this.email = email;
    this.password = password;
  }

  // Register new moderator
  static async create({ name, email, password }) {
    const result = await pool.query(
      `INSERT INTO moderator (name, email, password)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, email, password]
    );
    return new Moderator(...Object.values(result.rows[0]));
  }

  // Find moderator by ID
  static async findById(moderatorId) {
    const result = await pool.query(
      `SELECT * FROM moderator WHERE moderator_id = $1`,
      [moderatorId]
    );
    if (result.rows.length === 0) return null;
    return new Moderator(...Object.values(result.rows[0]));
  }

    // Find moderator by email
  static async findByEmail(email) {
    const result = await pool.query(
      `SELECT * FROM moderator WHERE email = $1`,
      [email]
    );
    if (result.rows.length === 0) return null;
    return new Moderator(...Object.values(result.rows[0]));
  }

  // Methods
  async createCard(cardName, category) {
    const result = await pool.query(
      `INSERT INTO card (card_name, category, moderator_id)
       VALUES ($1, $2, $3) RETURNING *`,
      [cardName, category, this.moderator_id]
    );
    return result.rows[0];
  }

  async createThreat(description) {
    const result = await pool.query(
      `INSERT INTO threat (description, created_by)
       VALUES ($1, $2) RETURNING *`,
      [description, this.moderator_id]
    );
    return result.rows[0];
  }

  async createCategory(categoryName) {
    const result = await pool.query(
      `INSERT INTO category (category_name, created_by)
       VALUES ($1, $2) RETURNING *`,
      [categoryName, this.moderator_id]
    );
    return result.rows[0];
  }

  /* Map a card to a threat
   * Uses ThreatAnswer model to handle DB logic.
   */
  async mapThreatAnswers(threat_id, card_id, answer_type = "correct") {
    const threatAnswer = await ThreatAnswer.create({
      threat_id,
      card_id,
      answer_type,
    });
    return threatAnswer;
  }

  // Update the set points for the answer types
  async updateThreatAnswerPoints(threatId, cardId, newPoints) {
    const result = await pool.query(
      `UPDATE threat_answer
       SET points = $3
       WHERE threat_id = $1 AND card_id = $2
       RETURNING *`,
      [threatId, cardId, newPoints]
    );

    if (result.rows.length === 0) {
      throw new Error("No matching threat answer found to update.");
    }

    return result.rows[0];
  }

  async setupGame(gameName, gameType) {
    const result = await pool.query(
      `INSERT INTO game (game_name, game_type, status)
       VALUES ($1, $2, 'pending') RETURNING *`,
      [gameName, gameType]
    );
    return result.rows[0];
  }

  async assignThreatToGame(gameId, threatId, orderNum = 1) {
    const result = await pool.query(
      `INSERT INTO game_threat (game_id, threat_id, order_num, is_active)
       VALUES ($1, $2, $3, false) RETURNING *`,
      [gameId, threatId, orderNum]
    );
    return result.rows[0];
  }
}

module.exports = Moderator;
