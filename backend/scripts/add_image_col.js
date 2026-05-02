const pool = require('./src/config/db');
async function run() {
  try {
    await pool.query('ALTER TABLE card ADD COLUMN image TEXT;');
    console.log('Column added successfully.');
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit();
}
run();
