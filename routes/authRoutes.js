// API routes for signup and login
const express = require("express");
const router = express.Router(); // import router to group routes together instead of putting everything in server.js

const User = require("../models/User"); // import the User model - needed to store and query users

// POST /api/signup
router.post("/signup", async (req, res) => {
  try {
    const { username, firstname, lastname, password } = req.body; // Get data from request body

    // Basic validation
    if (!username || !firstname || !lastname || !password) {
      return res.status(400).json({ message: "All fields are required." }); // All fiuelds are required - dont save incomplete records
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists." }); // 409 - status code for duplicate records
    }

    // Create user
    const newUser = new User({
      username,
      firstname,
      lastname,
      password,
    });

    await newUser.save(); // Insert user into mongodb

    return res.status(201).json({ // Status code 201 - created sucessfully - returns info except password
      message: "User created successfully",
      user: {
        _id: newUser._id,
        username: newUser.username,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        createdon: newUser.createdon,
      },
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    return res.status(500).json({ message: "Server error during signup." });
  }
});

// POST /api/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body; // read credentials

    // Basic validation
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required." }); // make sure all info is provided
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password." }); // check that user exist - 401 status code - unauthorized
    }

    // Check password
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password." }); // make sure assword match
    }

    // Login success
    return res.status(200).json({ // return 200 sucess response and info
      message: "Login successful",
      user: {
        _id: user._id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        createdon: user.createdon,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ message: "Server error during login." }); // return 500 is mongodb is down or something else fails
  }
});

module.exports = router;
