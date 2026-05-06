// # copy to db.js
const { Pool } = require("pg");

const pool = new Pool({
    user: process.env.DBUSER || "postgres",
    host: process.env.DBHOST || "localhost",
    database: process.env.DBNAME || "TTX",
    password: process.env.DBPASS || "@INTIAn12",
    port: process.env.DBPORT || 5432,
});

module.exports = pool;