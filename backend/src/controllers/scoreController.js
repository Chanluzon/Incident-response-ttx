const Score = require("../models/Score");
const pool = require("../config/db");

exports.getScore = async (req, res) => {
  try {
    const { group_id, round_id } = req.params;
    const score = await Score.find(group_id, round_id);
    if (!score) return res.status(404).send("Score not found");
    res.json({
      base_points: score.base_points,
      bonus_points: score.bonus_points,
      total_points: score.total_points,
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching score");
  }
};

exports.getLeaderboard = async (req, res) => {
  const { gameId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        g.group_id,
        g.group_name,
        COALESCE(SUM(s.total_points), 0) AS total_points
      FROM groups g
      JOIN game_group gg ON gg.group_id = g.group_id
      LEFT JOIN score s ON s.group_id = g.group_id
      WHERE gg.game_id = $1
      GROUP BY g.group_id, g.group_name
      ORDER BY total_points DESC
      `,
      [gameId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("LEADERBOARD ERROR:", err);
    res.status(500).json({ error: "Error fetching score" });
  }
};

exports.getRoundBreakdown = async (req, res) => {
  const { gameId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        r.round_number,
        g.group_name,
        s.base_points,
        s.bonus_points,
        s.total_points
      FROM score s
      JOIN round r ON r.round_id = s.round_id
      JOIN groups g ON g.group_id = s.group_id
      WHERE r.game_id = $1
      ORDER BY r.round_number, g.group_name
      `,
      [gameId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("BREAKDOWN ERROR:", err);
    res.status(500).json({ error: "Error fetching breakdown" });
  }
};

