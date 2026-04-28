const pool = require('../src/config/db');
require('dotenv').config();

async function provision() {
  try {
    console.log('Starting database provisioning...');
    
    const dbConfig = {
      user: process.env.DBUSER || 'postgres',
      host: process.env.DBHOST || 'localhost',
      database: process.env.DBNAME || 'ttxdb',
      password: process.env.DBPASS,
      port: process.env.DBPORT || 5432,
    };
    
    console.log(`Connecting to database: ${dbConfig.database} at ${dbConfig.host}:${dbConfig.port}`);
    
    await pool.query('SELECT 1');
    console.log('Database connection successful');
    
    const { Pool } = require('pg');
    const adminPool = new Pool({
      ...dbConfig,
      database: 'postgres'
    });
    
    try {
      const dbExists = await adminPool.query(
        "SELECT 1 FROM pg_database WHERE datname = $1",
        [dbConfig.database]
      );
      
      if (dbExists.rows.length === 0) {
        console.log(`Creating database: ${dbConfig.database}`);
        await adminPool.query(`CREATE DATABASE ${dbConfig.database}`);
        console.log('Database created successfully');
      } else {
        console.log('Database already exists');
      }
    } finally {
      await adminPool.end();
    }
    
    console.log('Database provisioning completed');
    console.log('Run "npm run migrate" to apply migrations');
    process.exit(0);
  } catch (error) {
    console.error('Provisioning failed:', error);
    process.exit(1);
  }
}

provision();