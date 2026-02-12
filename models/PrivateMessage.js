const mongoose = require("mongoose");

// Save which user wrote the message, to whom, what they wrote and when
const privateMessageSchema = new mongoose.Schema({
  from_user: { type: String, required: true, trim: true },
  to_user: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  date_sent: { type: String, default: () => new Date().toLocaleString() },
});

module.exports = mongoose.model("PrivateMessage", privateMessageSchema);
