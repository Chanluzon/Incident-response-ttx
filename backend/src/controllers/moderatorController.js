const Moderator = require("../models/Moderator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "supersecret";

// Register moderator
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const moderator = await Moderator.create({ name, email, password: hashedPassword });

    res.status(201).json(moderator);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register moderator" });
  }
};

// Login moderator
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await Moderator.findByEmail(email);
    if (!result) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, result.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: result.moderator_id }, SECRET, { expiresIn: "1h" });

    res.json({ token, moderator: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};

// Create a card
exports.createCard = async (req, res) => {
  try {
    const { cardName, category } = req.body;
    const moderatorId = req.user.id; // from JWT middleware

    const moderator = await Moderator.findById(moderatorId);
    if (!moderator) return res.status(404).json({ error: "Moderator not found" });

    const card = await moderator.createCard(cardName, category);
    res.status(201).json(card);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create card" });
  }
};

// Create a threat
exports.createThreat = async (req, res) => {
  try {
    const { description } = req.body;
    const moderatorId = req.user.id;

    const moderator = await Moderator.findById(moderatorId);
    if (!moderator) return res.status(404).json({ error: "Moderator not found" });

    const threat = await moderator.createThreat(description);
    res.status(201).json(threat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create threat" });
  }
};

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;
    const moderatorId = req.user.id;

    const moderator = await Moderator.findById(moderatorId);
    if (!moderator) return res.status(404).json({ error: "Moderator not found" });

    const category = await moderator.createCategory(categoryName);
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create category" });
  }
};

// Setup a game
exports.setupGame = async (req, res) => {
  try {
    const { gameName, gameType } = req.body;
    const moderatorId = req.user.id;

    const moderator = await Moderator.findById(moderatorId);
    if (!moderator) return res.status(404).json({ error: "Moderator not found" });

    const game = await moderator.setupGame(gameName, gameType);
    res.status(201).json(game);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to setup game" });
  }
};

// Assign threat to game
exports.assignThreatToGame = async (req, res) => {
  try {
    const { gameId, threatId, orderNum } = req.body;
    const moderatorId = req.user.id;

    const moderator = await Moderator.findById(moderatorId);
    if (!moderator) return res.status(404).json({ error: "Moderator not found" });

    const gameThreat = await moderator.assignThreatToGame(gameId, threatId, orderNum);
    res.status(201).json(gameThreat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to assign threat to game" });
  }
};

// Map a card to a threat (assign answer type and auto points)
exports.mapThreatAnswers = async (req, res) => {
  try {
    const { threatId, cardId, answerType } = req.body;
    const moderatorId = req.user.id;

    const moderator = await Moderator.findById(moderatorId);
    if (!moderator) return res.status(404).json({ error: "Moderator not found" });

    const mappedAnswer = await moderator.mapThreatAnswers(threatId, cardId, answerType);
    res.status(201).json(mappedAnswer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to map threat answers" });
  }
};

// Update points for an existing threat answer
exports.updateThreatAnswerPoints = async (req, res) => {
  try {
    const { threatId, cardId, newPoints } = req.body;
    const moderatorId = req.user.id;

    const moderator = await Moderator.findById(moderatorId);
    if (!moderator) return res.status(404).json({ error: "Moderator not found" });

    const updatedAnswer = await moderator.updateThreatAnswerPoints(threatId, cardId, newPoints);
    res.status(200).json(updatedAnswer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update threat answer points" });
  }
};
