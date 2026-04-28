// # copy to db.js
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DBUSER || "postgres",
  host: process.env.DBHOST || "localhost",
  database: process.env.DBNAME || "ttxdb",
  password: process.env.DBPASS || "gatto123",
  port: process.env.DBPORT || 5432,
});

module.exports = pool;
