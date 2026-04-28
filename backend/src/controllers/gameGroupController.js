const GameGroup = require("../models/GameGroup");
const Game = require("../models/Game");

// join using game code
exports.joinGameByCode = async (req, res) => {
  try {
    console.log("JOIN GAME BODY:", req.body);

    const { game_id, game_code, group_id } = req.body;

    // validate input
    if (!game_id || !game_code || !group_id) {
      return res.status(400).json({
        message: "game_id, game_code, and group_id are required",
      });
    }

    // resolve game by code (source of truth)
    const gameByCode = await Game.findByCode(game_code.toUpperCase());

    if (!gameByCode) {
      return res.status(400).json({
        message: "Invalid game code",
      });
    }

    // ensure code belongs to selected game
    if (gameByCode.game_id !== game_id) {
      return res.status(400).json({
        message: "Game code does not belong to this game",
      });
    }

    // prevent duplicate join
    const alreadyJoined = await GameGroup.hasJoined(
      game_id,
      group_id
    );

    if (alreadyJoined) {
      return res.status(200).json({
        success: true,
        message: "Already joined",
        game_id,
      });
    }

    // join game
    const joined = await GameGroup.joinGame(
      game_id,
      group_id
    );

    res.json({
      success: true,
      game_id,
      group_id: joined.group_id,
      joined_at: joined.joined_at,
    });

  } catch (err) {
      console.error("Join Game Error:", err.message);

      // already joined is NOT an error
      if (err.message === "Group already joined this game") {
        return res.status(200).json({
          success: true,
          message: "Already joined",
          game_id,
        });
      }

      // real server error
      res.status(500).json({
        message: "Server error joining game",
      });
    }
  };

// get groups in a game
exports.getGroupsInGame = async (req, res) => {
  try {
    const gameId = req.params.id;

    const groups = await GameGroup.getGroupsByGame(gameId);

    res.json(groups);
  } catch (err) {
    console.error("Get Groups Error:", err);
    res.status(500).json({ error: "Failed to fetch groups for game" });
  }
};
