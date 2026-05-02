const pool = require('./src/config/db');
async function run() {
  try {
    await pool.query("UPDATE card SET category = 'prepare' WHERE category = 'safeguard'");
    await pool.query("UPDATE card SET category = 'detect' WHERE category = 'vulnerability'");
    await pool.query("UPDATE card SET category = 'respond' WHERE category = 'threat agents'");
    await pool.query("UPDATE card SET category = 'recover' WHERE category = 'risk'");
    await pool.query("UPDATE card SET category = 'lessons learned' WHERE category = 'infosec pillars'");

    await pool.query("UPDATE category SET category_name = 'prepare' WHERE category_name = 'safeguard'");
    await pool.query("UPDATE category SET category_name = 'detect' WHERE category_name = 'vulnerability'");
    await pool.query("UPDATE category SET category_name = 'respond' WHERE category_name = 'threat agents'");
    await pool.query("UPDATE category SET category_name = 'recover' WHERE category_name = 'risk'");
    await pool.query("UPDATE category SET category_name = 'lessons learned' WHERE category_name = 'infosec pillars'");

    console.log('DB categories updated successfully.');
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit();
}
run();
