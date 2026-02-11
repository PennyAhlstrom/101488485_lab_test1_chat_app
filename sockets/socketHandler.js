const GroupMessage = require("../models/GroupMessage");

function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.id);

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

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected:", socket.id);
    });
  });
}

module.exports = socketHandler;
