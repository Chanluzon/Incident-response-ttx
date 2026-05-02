const Game = require("../models/Game");
const pool = require("../config/db");
const Round = require("../models/Round");

// create a new game
exports.createGame = async (req, res) => {
  try {
    const { game_name, game_type } = req.body;

    const game = await Game.create({
      game_name,
      game_type
    });

    res.json(game);
  } catch (err) {
    console.error("Create Game Error:", err);
    res.status(500).send("Error creating game");
  }
};

// get game by code
exports.getGameByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const result = await pool.query(
      `SELECT * FROM game WHERE game_code = $1`,
      [code.toUpperCase()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Game not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get Game By Code Error:", err);
    res.status(500).json({ message: "Failed to fetch game" });
  }
};

// get all games
exports.getAllGames = async (req, res) => {
  try {
    await pool.query(`
      UPDATE game g
      SET status = CASE
        WHEN EXISTS (
          SELECT 1
          FROM round r
          WHERE r.game_id = g.game_id
            AND r.is_started = TRUE
        )
        THEN 'active'
        ELSE 'pending'
      END
    `);

    const result = await pool.query(
      `SELECT * FROM game ORDER BY game_id DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get All Games Error:", err);
    res.status(500).send("Error fetching games");
  }
};

// add a round
exports.addRound = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).send("Game not found");

    const { round_number } = req.body;

    const round = await game.addRound(round_number);
    res.json(round);

  } catch (err) {
    console.error("Add Round Error:", err);
    res.status(500).send("Error adding round");
  }
};

exports.getRoundsByGame = async (req, res) => {
  try {
    const gameId = req.params.id;

    await Round.autoEndExpiredRounds(gameId);

    const rounds = await Round.findByGame(gameId);

    res.json(rounds);
  } catch (err) {
    console.error("Get Rounds Error:", err);
    res.status(500).send("Error fetching rounds");
  }
};

// delete a game
exports.deleteGame = async (req, res) => {
  try {
    const gameId = req.params.id;

    const game = await Game.findById(gameId);
    if (!game) return res.status(404).send("Game not found");

    const deleted = await Game.delete(gameId);
    if (!deleted) return res.status(500).send("Failed to delete game");

    res.json({ message: "Game deleted successfully", deleted });

  } catch (err) {
    console.error("Delete Game Error:", err);
    res.status(500).json({ error: err.message });
  }
};


exports.getUsedCardsByGroup = async (req, res) => {
  try {
    const { id, groupId } = req.params;
    const result = await pool.query(`
      SELECT DISTINCT rcs.card_id 
      FROM round_card_selection rcs
      JOIN round r ON rcs.round_id = r.round_id
      WHERE r.game_id = $1 AND rcs.group_id = $2
    `, [id, groupId]);

    const usedCardIds = result.rows.map(row => row.card_id);
    res.json(usedCardIds);
  } catch (err) {
    console.error("Get Used Cards Error:", err);
    res.status(500).send("Error fetching used cards");
  }
};
