const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: 5432, // Default PostgreSQL port
  ssl: { rejectUnauthorized: false }, // Required for Koyeb's PostgreSQL
});

// Initialize database schema
const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS members (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        member_id UUID REFERENCES members(id) ON DELETE CASCADE,
        month TEXT NOT NULL,
        amount REAL NOT NULL,
        year INTEGER NOT NULL,
        UNIQUE (member_id, month, year)
      );
      
      CREATE TABLE IF NOT EXISTS yearly_extras (
        id SERIAL PRIMARY KEY,
        year INTEGER UNIQUE NOT NULL,
        amount REAL NOT NULL
      );
    `);
    console.log("Database schema initialized");
  } catch (err) {
    console.error("Error initializing database schema:", err);
  }
};

module.exports = { pool, initDatabase };
