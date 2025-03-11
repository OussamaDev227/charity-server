const express = require("express");
const router = express.Router();
const { pool } = require("../db");

// Get all members with payments for a specific year
router.get("/", async (req, res) => {
  const { year } = req.query;
  try {
    const result = await pool.query(
      `
      SELECT 
        m.id, 
        m.name,
        COALESCE(jsonb_object_agg(p.month, p.amount) FILTER (WHERE p.month IS NOT NULL), '{}'::jsonb) AS payments,
        COALESCE(SUM(ye.amount), 0) AS yearly_extra
      FROM members m
      LEFT JOIN payments p ON m.id = p.member_id AND p.year = $1
      LEFT JOIN yearly_extras ye ON ye.year = $1
      GROUP BY m.id
      `,
      [year]
    );
    res.json({
      members: result.rows,
      yearlyExtra: result.rows[0]?.yearly_extra || 0,
    });
  } catch (err) {
    console.error("Error fetching members:", err);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

// Add a new member
router.post("/", async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO members (id, name) VALUES (uuid_generate_v4(), $1) RETURNING *",
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding member:", err);
    res.status(500).json({ error: "Failed to add member" });
  }
});

// Delete a member
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM members WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting member:", err);
    res.status(500).json({ error: "Failed to delete member" });
  }
});

// Update payment for a member
router.post("/payments", async (req, res) => {
  const { memberId, month, amount, year } = req.body;
  try {
    await pool.query(
      `
      INSERT INTO payments (member_id, month, amount, year)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (member_id, month, year) DO UPDATE SET amount = EXCLUDED.amount
      `,
      [memberId, month, amount, year]
    );
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error updating payment:", err);
    res.status(500).json({ error: "Failed to update payment" });
  }
});

// Add yearly extra amount
router.post("/yearly-extra", async (req, res) => {
  const { year, amount } = req.body;
  try {
    await pool.query(
      "INSERT INTO yearly_extras (year, amount) VALUES ($1, $2) ON CONFLICT (year) DO UPDATE SET amount = EXCLUDED.amount",
      [year, amount]
    );
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error adding yearly extra:", err);
    res.status(500).json({ error: "Failed to add yearly extra" });
  }
});

module.exports = router;
