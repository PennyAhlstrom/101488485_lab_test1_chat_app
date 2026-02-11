// Keep DB connection code separate from server.js - best practise - keeps the code clean
const mongoose = require("mongoose");   //Import the mongoose library so Node.js can talk to MongoDB via models/schemas

// Connect to MongoDB using the connection string hidden in .env
async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB; // Export the function so server.js can call it
