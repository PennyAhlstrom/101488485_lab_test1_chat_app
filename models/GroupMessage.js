const mongoose = require("mongoose");

// Save which user sent a message, in which room , what thye wrote and when
const groupMessageSchema = new mongoose.Schema({
  from_user: { type: String, required: true, trim: true },
  room: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  date_sent: { type: String, default: () => new Date().toLocaleString() },
});

module.exports = mongoose.model("GroupMessage", groupMessageSchema);
