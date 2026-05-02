const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");

/**
 * @swagger
 * tags:
 *   name: Games
 *   description: Game management endpoints
 */

/**
 * @swagger
 * /games/test:
 *   get:
 *     summary: Test game route
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: Route is working
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Game route works!
 */
router.get("/test", (req, res) => 
    res.send("Game route works!"));

router.get("/", gameController.getAllGames);

/**
 * @swagger
 * /games:
 *   post:
 *     summary: Create a new game
 *     tags: [Games]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Game name
 *               moderatorId:
 *                 type: string
 *                 description: Moderator ID
 *     responses:
 *       201:
 *         description: Game created successfully
 *       400:
 *         description: Invalid input
 */
router.post("/", gameController.createGame);

/**
 * @swagger
 * /games/{id}/rounds:
 *   post:
 *     summary: Add a round to a game
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Game ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roundNumber:
 *                 type: integer
 *                 description: Round number
 *               threatId:
 *                 type: string
 *                 description: Threat ID for this round
 *     responses:
 *       201:
 *         description: Round added successfully
 *       404:
 *         description: Game not found
 */

// Get all rounds for a game
router.get("/:id/rounds", gameController.getRoundsByGame);
router.post("/:id/rounds", gameController.addRound);
router.delete("/:id", gameController.deleteGame);
router.get("/:id/groups/:groupId/used-cards", gameController.getUsedCardsByGroup);

module.exports = router;
