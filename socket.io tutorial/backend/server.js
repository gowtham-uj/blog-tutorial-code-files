const app = require("express")();
const http = require("http").createServer(app);
const { instrument } = require("@socket.io/admin-ui");

const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

instrument(io, {
  auth: {
    type: "basic",
    username: "some user name here",
    password: "some super long secrete password here",
  },
});

let users = [];

io.on("connection", (socket) => {
  users.push(socket.id);
  socket.broadcast.emit("newUserJoined", {
    userName: socket.id,
  });
  socket.on("newMsg", (payload) => {
    const rooms = Array.from(socket.rooms);
    // console.log(socket.rooms);
    socket.broadcast.emit("newMsg", payload);
  });
  socket.on("send-private-msg", (payload) => {
    socket.to(users[1]).emit("got-private-msg", payload);
  });
  socket.on("disconnect", () => {
    socket.broadcast.emit("userDisconnect", {
      userName: socket.id,
      msg: "user disconnected",
    });
  });
  socket.on("grpJoinReq", (payload) => {
    socket.join(payload.grpName);
    socket.to(payload.grpName).emit("joinedNewGrp", payload);
  });
});
