const mongoose = require("mongoose"); // Import mongoose - needed to define schema and model

const userSchema = new mongoose.Schema({ 
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  firstname: {
    type: String,
    required: true,
    trim: true,
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdon: {
    type: String,
    default: () => new Date().toLocaleString(), // mongoose automatically fills this if not provided
  },
});

module.exports = mongoose.model("User", userSchema); // create and export the model
