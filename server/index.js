const bodyParser = require("body-parser");
const express = require("express");
const { Server } = require("socket.io");

const io = new Server({
  cors: true,
});
const app = express();
app.use(bodyParser.json());

const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();
io.on("connection", (socket) => {
  socket.on("join-room", (data) => {
    const { roomId, emailId } = data;
    console.log("Usser", emailId, "Joined room", roomId);
    emailToSocketMapping.set(emailId, socket.id);
    socketToEmailMapping.set(socket.id, emailId);
    socket.join(roomId);
    socket.emit("joined-room", { roomId });
    socket.broadcast.to(roomId).emit("user-joined", { emailId });
  });

  socket.on("call-user", (data) => {
    const { emailId, offer } = data;
    const fromEmail = socketToEmailMapping.get(socket.id);
    const socketId = emailToSocketMapping.get(emailId);
    console.log("here2");

    socket.to(socketId).emit("incomming-call", { from: fromEmail, offer });
  });

  socket.on("call-accepted", (data) => {
    const { emailId, ans } = data;
    const socketId = emailToSocketMapping.get(emailId);
    console.log("here", socketId);

    socket.to(socketId).emit("call-accepted", { ans });
  });
});

app.listen(8000, () => {
  console.log("http running at port 8000");
});

io.listen(8001);
