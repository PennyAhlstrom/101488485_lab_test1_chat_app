require("dotenv").config(); // load variable from .env

const path = require("path");
const http = require("http"); // Socket.io needs access to the HTTP server (not just express)

const express = require("express"); // Express is the webservers framework - handles routes, api endpoints, middleware
const cors = require("cors"); // used to allow the backend to call the browser

const { Server } = require("socket.io"); // socket is our realtime messaging system
const connectDB = require("./config/db"); // import the mongodb connection string

// Create express, http, socketio
const app = express(); // express app
const server = http.createServer(app); // http server running express (socket io needs this)

// Create socket io server attached to http server
const io = new Server(server, {
  cors: {
    origin: "*", // for development only
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors()); // allow cross-origin requests (for separated frontend/backend)
app.use(express.json()); // for express to read incoming request data in JSON body format
app.use(express.urlencoded({ extended: true })); // for express to read incoming request data from traditional html forms

// Serve static files - make everything inside public/ available to the browser
app.use(express.static(path.join(__dirname, "public")));

// Basic routes
app.get("/", (req, res) => { // Home page to login page
  res.redirect("/login");
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "signup.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/rooms", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "rooms.html"));
});

app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "chat.html"));
});

// Check that express works and the server is running
// Useful for testing
// http://localhost:3000/api/health - status and message confirms that this is working
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Socket.io connection events
io.on("connection", (socket) => {
  console.log("🟢 A user connected:", socket.id); // Logs the socket id

  socket.emit("connected", { socketId: socket.id }); // Send the socket id back to the client

  socket.on("disconnect", () => {
    console.log("🔴 A user disconnected:", socket.id); // Logs disconnections 
  });
});

// Start the server
const PORT = process.env.PORT || 3000; // Use specified .env port or 3000 if non exist

async function startServer() {
  await connectDB(); // connect to mongodb

  server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`); // only start the server once mongodb is connected
  });
}

startServer();
