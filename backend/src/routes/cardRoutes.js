const express = require("express");
const router = express.Router();
const cardController = require("../controllers/cardController");

/**
 * @swagger
 * tags:
 *   name: Cards
 *   description: Card management endpoints
 */

/**
 * @swagger
 * /card/test:
 *   get:
 *     summary: Test card route
 *     tags: [Cards]
 *     responses:
 *       200:
 *         description: Route is working
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Card route works!
 */
router.get("/test", (req, res) => 
    res.send("Card route works!"));

/**
 * @swagger
 * /card:
 *   post:
 *     summary: Create a new card
 *     tags: [Cards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Card name
 *               description:
 *                 type: string
 *                 description: Card description
 *               type:
 *                 type: string
 *                 description: Card type
 *               cost:
 *                 type: number
 *                 description: Card cost
 *     responses:
 *       201:
 *         description: Card created successfully
 *       400:
 *         description: Invalid input
 */
router.post("/", cardController.createCard);

/**
 * @swagger
 * /card/{id}:
 *   get:
 *     summary: Get a card by ID
 *     tags: [Cards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Card ID
 *     responses:
 *       200:
 *         description: Card details
 *       404:
 *         description: Card not found
 */
router.get("/:id", cardController.getCard);

/**
 * @swagger
 * /card:
 *   get:
 *     summary: Get all cards
 *     tags: [Cards]
 *     responses:
 *       200:
 *         description: List of all cards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   type:
 *                     type: string
 *                   cost:
 *                     type: number
 */
router.get("/", cardController.getAllCards);

router.put("/:id", cardController.updateCard);
router.delete("/:id", cardController.deleteCard);
router.post("/bulk-delete", cardController.bulkDeleteCards);

/**
 * @swagger
 * /card/{id}/threats:
 *   post:
 *     summary: Assign a card to a threat
 *     tags: [Cards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Card ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               threatId:
 *                 type: string
 *                 description: Threat ID to assign the card to
 *     responses:
 *       200:
 *         description: Card assigned successfully
 *       404:
 *         description: Card or threat not found
 */
router.post("/:id/threats", cardController.assignToThreat);

module.exports = router;
