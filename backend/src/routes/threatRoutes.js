const express = require("express");
const router = express.Router();
const threatController = require("../controllers/threatController");

/**
 * @swagger
 * tags:
 *   name: Threats
 *   description: Threat management endpoints
 */

/**
 * @swagger
 * /threat/test:
 *   get:
 *     summary: Test threat route
 *     tags: [Threats]
 *     responses:
 *       200:
 *         description: Route is working
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Threat route works!
 */
router.get("/test", (req, res) => 
    res.send("Threat route works!"));

/**
 * @swagger
 * /threat:
 *   post:
 *     summary: Create a new threat
 *     tags: [Threats]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Threat name
 *               description:
 *                 type: string
 *                 description: Threat description
 *               severity:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *                 description: Threat severity level
 *     responses:
 *       201:
 *         description: Threat created successfully
 *       400:
 *         description: Invalid input
 */
router.post("/", threatController.createThreat);

/**
 * @swagger
 * /threat/{id}:
 *   get:
 *     summary: Get a threat by ID
 *     tags: [Threats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Threat ID
 *     responses:
 *       200:
 *         description: Threat details
 *       404:
 *         description: Threat not found
 */
router.get("/:id", threatController.getThreat);

/**
 * @swagger
 * /threat:
 *   get:
 *     summary: Get all threats
 *     tags: [Threats]
 *     responses:
 *       200:
 *         description: List of all threats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/", threatController.getAllThreats);

/**
 * @swagger
 * /threat/{id}:
 *   put:
 *     summary: Update a threat
 *     tags: [Threats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Threat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               severity:
 *                 type: string
 *     responses:
 *       200:
 *         description: Threat updated successfully
 *       404:
 *         description: Threat not found
 */
router.put("/:id", threatController.updateThreat);

/**
 * @swagger
 * /threat/{id}/cards:
 *   post:
 *     summary: Link cards to a threat
 *     tags: [Threats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Threat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cardIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of card IDs to link
 *     responses:
 *       200:
 *         description: Cards linked successfully
 *       404:
 *         description: Threat or cards not found
 */
router.post("/:id/cards", threatController.linkCards);

router.delete("/:id", threatController.deleteThreat);

module.exports = router;
