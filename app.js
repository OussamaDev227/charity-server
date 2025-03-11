require("dotenv").config(); // Load environment variables
const PORT = process.env.PORT || 5000;
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

// PostgreSQL connection
const pool = new Pool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: 5432, // Default PostgreSQL port
  ssl: { rejectUnauthorized: false }, // Required for Koyeb's PostgreSQL
});


// Test database connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Error connecting to PostgreSQL:", err);
  } else {
    console.log("Connected to PostgreSQL at:", res.rows[0].now);
  }
});

// Middleware
app.use(express.json());
const allowedOrigins = [
  "https://meraguen-charity-frontend.netlify.app", // Production
  "https://meraguen-charity2-frontend.netlify.app", // Production
  "http://localhost:5173", // Local development
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

// Routes
app.get("/", (req, res) => {
  res.send("Backend is live!");
});

// Members routes
app.use("/api/members", require("./routes/members"));

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
