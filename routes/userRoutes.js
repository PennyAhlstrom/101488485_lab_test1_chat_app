const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET /api/users
router.get("/users", async (req, res) => {
  try {
    // return usernames only (safe + simple)
    const users = await User.find({}, { username: 1, _id: 0 }).sort({ username: 1 });
    res.json({ users: users.map(u => u.username) });
  } catch (err) {
    console.error("GET /api/users error:", err.message);
    res.status(500).json({ message: "Server error loading users." });
  }
});

module.exports = router;
