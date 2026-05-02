console.log(">>> src/app.js loaded <<<");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const gameRoutes = require("./routes/gameRoutes");
const moderatorRoutes = require("./routes/moderatorRoutes");
const gameSettingsRoutes = require("./routes/gameSettingsRoutes");
const groupRoutes = require("./routes/groupRoutes");
const gameGroupRoutes = require("./routes/gameGroupRoutes");
const roundRoutes = require("./routes/roundRoutes");
const gameThreatRoutes = require("./routes/gameThreatRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const threatRoutes = require("./routes/threatRoutes");
const cardRoutes = require("./routes/cardRoutes");
const threatCategoryRoutes = require("./routes/threatCategoryRoutes");
const threatAnswerRoutes = require("./routes/threatAnswerRoutes");
const cardUsageRoutes = require("./routes/cardUsageRoutes");
const roundCardSelection = require("./routes/roundCardSelectionRoutes");
const scoreRoutes = require("./routes/scoreRoutes");

const app = express();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
require("dotenv").config();

app.use(cors());

// Swagger UI
const myAPIDOC = process.env.API_DOC || false;
if (myAPIDOC == "true") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
} else {
  app.get("/api-docs", function (req, res) {
    res.send("API documentation disabled");
  });
}

/**
 * @swagger
 * /test:
 *   get:
 *     summary: Test endpoint
 *     description: Simple test endpoint to verify the API is working
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: AHHHHHHHHHH!!!
 */
app.get("/test", (req, res) => {
  console.log(">>> /test route hit <<<");
  res.send("AHHHHHHHHHH!!!");
});

app.use("/games", gameRoutes);
app.use("/api/moderator", moderatorRoutes);
app.use("/game-settings", gameSettingsRoutes);
app.use("/group", groupRoutes);
app.use("/game-group", gameGroupRoutes);
app.use("/round", roundRoutes);
app.use("/game-threat", gameThreatRoutes);
app.use("/category", categoryRoutes);
app.use("/threat", threatRoutes);
app.use("/card", cardRoutes);
app.use("/threat-category", threatCategoryRoutes);
app.use("/threat-answer", threatAnswerRoutes);
app.use("/card-usage", cardUsageRoutes);
app.use("/round-card-selection", roundCardSelection);
app.use("/score", scoreRoutes);

module.exports = app;
