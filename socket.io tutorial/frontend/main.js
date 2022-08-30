import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";

const userNameEl = document.querySelector(".user-name-span");
const chatBox = document.querySelector(".chat-box");
const sendMsgInput = document.querySelector("#send-msg-input");

const sendMsgBtn = document.querySelector("#send-msg-btn");

const joinNewGrpEl = document.querySelector("#join-new-grp-input");

const joinNewGrpBtnEl = document.querySelector("#join-new-grp-btn");

function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addMessageToChat(message) {
  const newMsgDiv = document.createElement("div");
  newMsgDiv.classList.add("chat-msg", "p-2");
  const newUsrName = document.createElement("span");
  newUsrName.classList.add("text-sm");
  newUsrName.textContent = `${message.userName} :`;
  newMsgDiv.append(newUsrName);
  const brLine = document.createElement("br");
  newMsgDiv.append(brLine);
  const userMsg = document.createElement("span");
  userMsg.classList.add("text-lg", "pl-3");
  userMsg.textContent = message.msg;
  newMsgDiv.append(userMsg);
  chatBox.append(newMsgDiv);
}

const socket = await io("http://localhost:3000/");

socket.on("connect", () => {
  userNameEl.textContent = socket.id;

  socket.on("newMsg", (payload) => {
    addMessageToChat(payload);
  });
  socket.on("newUserJoined", (payload) => {
    addMessageToChat({ userName: payload.userName, msg: "a new user joined" });
  });
  socket.on("userDisconnect", (payload) => {
    addMessageToChat(payload);
  });
  socket.on("joinedNewGrp", (payload) => {
    const displayMsg = {
      userName: `${payload.userName} | ${payload.grpName}`,
      msg: `${payload.userName} has joined the group ${payload.grpName}`,
    };
    addMessageToChat(displayMsg);
  });
  socket.on("got-private-msg", (payload) => {
    // do something with that payload display it on the private msg borad with name linked.
    console.log(payload);
  });
});

function emitPrivateMsg(data) {
  socket.emit("send-private-msg", data);
}

sendMsgBtn.addEventListener("click", (event) => {
  addMessageToChat({
    userName: "You",
    msg: sendMsgInput.value,
  });
  socket.emit("newMsg", {
    userName: socket.id,
    msg: sendMsgInput.value,
  });
});

joinNewGrpBtnEl.addEventListener("click", (event) => {
  addMessageToChat({
    userName: "You",
    msg: ` you joined the group ${joinNewGrpEl.value}`,
  });

  socket.emit("grpJoinReq", {
    userName: socket.id,
    grpName: joinNewGrpEl.value,
  });
});
