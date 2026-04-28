const Round = require("../models/Round");
const pool = require("../config/db");

// create round
exports.createRound = async (req, res) => {
  try {
    const {
      round_number,
      game_id,
      game_threat_id,
      duration_minutes,
      first_submit_bonus
    } = req.body;

    const round = await Round.create({
      round_number,
      game_id,
      game_threat_id,
      duration_minutes,
      first_submit_bonus
    });

    res.status(201).json(round);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating round");
  }
};

// start round
exports.startRound = async (req, res) => {
  try {
    const round = await Round.findById(req.params.id);
    if (!round) return res.status(404).send("Round not found");

    const updated = await round.startRound();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error starting round");
  }
};

// restart round
exports.restartRound = async (req, res) => {
  try {
    const round = await Round.findById(req.params.id);
    if (!round) return res.status(404).send("Round not found");

    const updated = await round.restartRound();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error restarting round");
  }
};

// update timer
exports.updateRoundTimer = async (req, res) => {
  try {
    const { duration_minutes } = req.body;
    const round = await Round.findById(req.params.id);

    if (!round) return res.status(404).send("Round not found");

    const updated = await round.updateDuration(duration_minutes);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating round timer");
  }
};

// end round
exports.endRound = async (req, res) => {
  try {
    const round = await Round.findById(req.params.id);
    if (!round) return res.status(404).send("Round not found");

    const updated = await round.endRound();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error ending round");
  }
};

// submit answer
exports.submitAnswers = async (req, res) => {
  const { id: roundId } = req.params;
  const { group_id } = req.body;

  try {
    await pool.query(
      `
      INSERT INTO round_submission (round_id, group_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [roundId, group_id]
    );

    res.sendStatus(200);
  } catch (err) {
    console.error("Submit error:", err);
    res.status(500).send("Submit failed");
  }
};

// finalize round
exports.finalizeRound = async (req, res) => {
  const { id: roundId } = req.params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const check = await client.query(
      `
      SELECT is_evaluated
      FROM round
      WHERE round_id = $1
      FOR UPDATE
      `,
      [roundId]
    );

    if (check.rows[0]?.is_evaluated) {
      await client.query("ROLLBACK");
      return res.status(200).send("Already finalized");
    }

    const bonusRes = await client.query(
      `SELECT first_submit_bonus FROM round WHERE round_id = $1`,
      [roundId]
    );
    const firstSubmitBonus = Number(bonusRes.rows[0]?.first_submit_bonus || 0);

    const groups = await client.query(
      `
      SELECT gg.group_id
      FROM game_group gg
      JOIN round r ON r.game_id = gg.game_id
      WHERE r.round_id = $1
      `,
      [roundId]
    );

    const fastest = await client.query(
      `
      SELECT group_id
      FROM round_submission
      WHERE round_id = $1
      ORDER BY submitted_at ASC
      LIMIT 1
      `,
      [roundId]
    );

    const fastestGroupId = fastest.rows[0]?.group_id ?? null;

    for (const { group_id } of groups.rows) {
      const scoreResult = await client.query(
        `
        SELECT COALESCE(SUM(ta.points), 0) AS points
        FROM round_card_selection rcs
        JOIN round r ON r.round_id = rcs.round_id
        JOIN game_threat gt ON gt.game_threat_id = r.game_threat_id
        JOIN threat_answer ta
          ON ta.card_id = rcs.card_id
         AND ta.threat_id = gt.threat_id
        WHERE rcs.round_id = $1
          AND rcs.group_id = $2
        `,
        [roundId, group_id]
      );

      const basePoints = Number(scoreResult.rows[0].points || 0);
      const bonusPoints =
        group_id === fastestGroupId ? firstSubmitBonus : 0;

      const totalPoints = basePoints + bonusPoints;

      await client.query(
        `
        INSERT INTO score (round_id, group_id, base_points, bonus_points, total_points)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (round_id, group_id)
        DO UPDATE SET
          base_points = EXCLUDED.base_points,
          bonus_points = EXCLUDED.bonus_points,
          total_points = EXCLUDED.total_points
        `,
        [roundId, group_id, basePoints, bonusPoints, totalPoints]
      );
    }

    await client.query(
      `
      UPDATE round
      SET is_evaluated = TRUE,
          status = 'ended'
      WHERE round_id = $1
      `,
      [roundId]
    );

    await client.query("COMMIT");
    res.sendStatus(200);

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("FINALIZE ERROR:", err);
    res.status(500).send("Failed to finalize round");
  } finally {
    client.release();
  }
};


