const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const data = await db.loadMembersWithPayments(
      req.query.year || new Date().getFullYear()
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  try {
    const id = Date.now().toString();
    await db.saveMember(id, name);
    res.status(201).json({ id, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.deleteMember(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/payments", async (req, res) => {
  const { memberId, month, amount, year } = req.body;
  if (!memberId || !month || !year) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    await db.savePayment(memberId, month, amount, year);
    res.status(201).json({ memberId, month, amount, year });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/yearly-extra", async (req, res) => {
  const { year, amount } = req.body;
  console.log("POST /api/members/yearly-extra received:", { year, amount });
  if (!year || !amount) {
    console.log("Missing fields, returning 400");
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    await db.saveYearlyExtra(year, amount);
    console.log("Yearly extra saved successfully");
    res.status(201).json({ year, amount });
  } catch (err) {
    console.error("Error in POST /yearly-extra:", err);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
