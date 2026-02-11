const express = require("express");
const router = express.Router();
const PrivateMessage = require("../models/PrivateMessage");

// GET /api/private-messages?user=a&with=b
router.get("/private-messages", async (req, res) => {
  try {
    const { user, with: other } = req.query;

    if (!user || !other) {
      return res.status(400).json({ message: "user and with query params are required" });
    }

    const messages = await PrivateMessage.find({
      $or: [
        { from_user: user, to_user: other },
        { from_user: other, to_user: user },
      ],
    })
      .sort({ _id: 1 })
      .limit(200);

    res.json({ messages });
  } catch (err) {
    console.error("GET /api/private-messages error:", err.message);
    res.status(500).json({ message: "Server error loading private messages." });
  }
});

module.exports = router;
