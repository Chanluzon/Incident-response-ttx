const pool = require('./src/config/db');
async function run() {
  try {
    await pool.query("ALTER TYPE card_type_enum RENAME VALUE 'safeguard' TO 'prepare'");
  } catch(e) { console.log(e.message); }
  try {
    await pool.query("ALTER TYPE card_type_enum RENAME VALUE 'vulnerability' TO 'detect'");
  } catch(e) { console.log(e.message); }
  try {
    await pool.query("ALTER TYPE card_type_enum RENAME VALUE 'threat agents' TO 'respond'");
  } catch(e) { console.log(e.message); }
  try {
    await pool.query("ALTER TYPE card_type_enum RENAME VALUE 'risk' TO 'recover'");
  } catch(e) { console.log(e.message); }
  try {
    await pool.query("ALTER TYPE card_type_enum RENAME VALUE 'infosec pillars' TO 'lessons learned'");
  } catch(e) { console.log(e.message); }

  // Also update category table just in case it's string based
  try {
    await pool.query("UPDATE category SET category_name = 'prepare' WHERE category_name = 'safeguard'");
    await pool.query("UPDATE category SET category_name = 'detect' WHERE category_name = 'vulnerability'");
    await pool.query("UPDATE category SET category_name = 'respond' WHERE category_name = 'threat agents'");
    await pool.query("UPDATE category SET category_name = 'recover' WHERE category_name = 'risk'");
    await pool.query("UPDATE category SET category_name = 'lessons learned' WHERE category_name = 'infosec pillars'");
  } catch(e) { console.log(e.message); }

  console.log('Enum updated successfully.');
  process.exit();
}
run();
