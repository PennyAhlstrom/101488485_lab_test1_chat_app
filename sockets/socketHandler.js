const GroupMessage = require("../models/GroupMessage");
const PrivateMessage = require("../models/PrivateMessage");

function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.id);

     // Register user to a personal room for DMs
    socket.on("registerUser", ({ username }) => {
      if (!username) return;
      const personalRoom = `user:${username}`;
      socket.join(personalRoom);
      socket.data.username = username; // store on socket
      console.log(`👤 Registered ${username} to ${personalRoom}`);
    });


    // Join a room
    socket.on("joinRoom", ({ username, room }) => {
      if (!username || !room) return;
      socket.join(room);
      console.log(`✅ ${username} joined room: ${room}`);
    });

    socket.on("leaveRoom", ({ username, room }) => {
      if (!room) return;
      socket.leave(room);
      console.log(`↩️ ${username || "User"} left room: ${room}`);
    });

    socket.on("typing", ({ username, room }) => {
      if (!username || !room) return;
      socket.to(room).emit("typing", { username });
    });

    socket.on("stopTyping", ({ room }) => {
      if (!room) return;
      socket.to(room).emit("stopTyping");
    });

    socket.on("roomMessage", async ({ from_user, room, message }) => {
      try {
        if (!from_user || !room || !message) return;

        const msgDoc = new GroupMessage({
          from_user,
          room,
          message,
        });

        await msgDoc.save();
        console.log("✅ Saved GROUP message:", msgDoc._id, "collection:", GroupMessage.collection.name);

        io.to(room).emit("roomMessage", {
          from_user: msgDoc.from_user,
          room: msgDoc.room,
          message: msgDoc.message,
          date_sent: msgDoc.date_sent,
        });
      } catch (err) {
        console.error("roomMessage save error:", err.message);
      }
    });

    // Private messaging
    socket.on("privateTyping", ({ from_user, to_user }) => {
      if (!from_user || !to_user) return;
      io.to(`user:${to_user}`).emit("privateTyping", { from_user });
    });

    socket.on("privateStopTyping", ({ to_user }) => {
      if (!to_user) return;
      io.to(`user:${to_user}`).emit("privateStopTyping");
    });

    socket.on("privateMessage", async ({ from_user, to_user, message }) => {
      try {
        if (!from_user || !to_user || !message) return;

        const msgDoc = new PrivateMessage({ from_user, to_user, message });
        await msgDoc.save();

        const payload = {
          from_user: msgDoc.from_user,
          to_user: msgDoc.to_user,
          message: msgDoc.message,
          date_sent: msgDoc.date_sent,
        };

        // deliver messages to both users - each has their own personal room
        io.to(`user:${to_user}`).emit("privateMessage", payload);
        io.to(`user:${from_user}`).emit("privateMessage", payload);
      } catch (err) {
        console.error("privateMessage save error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected:", socket.id);
    });
  });
}

module.exports = socketHandler;
