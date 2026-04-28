const pool = require("../config/db");

class ThreatAnswer {
  constructor({ threat_id, card_id, points, answer_type }) {
    this.threat_id = threat_id;
    this.card_id = card_id;
    this.points = points;
    this.answer_type = answer_type;
  }

  /* Create or map a card as an answer to a threat.
   * Points are auto-assigned: 5 for correct, 3 for close, and 1 for wrong
   */
  static async create({ threat_id, card_id, answer_type = "correct", points }) {
    if (points == null) {
      if (answer_type === "correct") points = 5;
      else if (answer_type === "close") points = 3;
      else points = 1;
    }

    const result = await pool.query(
      `INSERT INTO threat_answer (threat_id, card_id, answer_type, points)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [threat_id, card_id, answer_type, points]
    );

    return new ThreatAnswer(result.rows[0]);
  }

  // Update answer_type and auto-assign points
  static async update(threat_id, card_id, answer_type, points) {
    if (points == null) {
      if (answer_type === "correct") points = 5;
      else if (answer_type === "close") points = 3;
      else points = 1;
    }

    const result = await pool.query(
      `UPDATE threat_answer
      SET answer_type = $3,
          points = $4
      WHERE threat_id = $1 AND card_id = $2
      RETURNING *`,
      [threat_id, card_id, answer_type, points]
    );

    return result.rows[0];
  }

  // Validate if a card is an answer for a threat
  static async validateAnswer(threat_id, card_id) {
    const result = await pool.query(
      `SELECT answer_type, points
       FROM threat_answer
       WHERE threat_id = $1 AND card_id = $2`,
      [threat_id, card_id]
    );

    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        isCorrect: row.answer_type === "correct",
        answerType: row.answer_type,
        points: row.points,
      };
    }

    // If not found, default to wrong answer
    return {
      isCorrect: false,
      answerType: "wrong",
      points: 1,
    };
  }

  // Get all answers for a threat with points and type
  static async findAnswersByThreat(threat_id) {
  const result = await pool.query(
    `SELECT 
        t.threat_id,
        t.description AS threat_description,
        c.card_id,
        c.card_name,
        ta.answer_type,
        ta.points
     FROM threat t
     JOIN threat_answer ta ON t.threat_id = ta.threat_id
     JOIN card c ON c.card_id = ta.card_id
     WHERE t.threat_id = $1`,
    [threat_id]
  );
  return result.rows;
}

  // Delete threat answer column
  static async delete(threat_id, card_id){
    const result = await pool.query(
      `DELETE FROM threat_answer
       WHERE threat_id = $1 AND card_id = $2
       RETURNING *`,
        [threat_id, card_id]
    );
    return result.rows[0];
  }
}

module.exports = ThreatAnswer;
