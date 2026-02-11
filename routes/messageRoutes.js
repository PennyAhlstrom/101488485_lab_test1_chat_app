const express = require("express");
const router = express.Router();

const GroupMessage = require("../models/GroupMessage");

// GET /api/messages?room=devops
router.get("/messages", async (req, res) => {
  try {
    const { room } = req.query;
    if (!room) return res.status(400).json({ message: "room query param is required" });

    const messages = await GroupMessage.find({ room }).sort({ _id: 1 }).limit(200);

    res.json({ messages });
  } catch (err) {
    console.error("Message history error:", err.message);
    res.status(500).json({ message: "Server error loading messages." });
  }
});

module.exports = router;
