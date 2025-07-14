const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
app.use(express.static("public"));

let dots = {}; // { id: { x, y, r, theta, color } }

function getRandomColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 100%, 80%)`;
}

io.on("connection", (socket) => {
  // 接続時にランダムな色を割り当てる
  dots[socket.id] = {
    x: 0,
    y: 0,
    r: 0,
    theta: 0,
    color: getRandomColor()
  };

  // 自分のIDを送信
  socket.emit("init", socket.id);



  // 位置情報更新
  socket.on("move", (pos) => {
    if (dots[socket.id]) {
      dots[socket.id].r = pos.r;
      dots[socket.id].theta = pos.theta;
    }
  });

  socket.on("disconnect", () => {
    delete dots[socket.id];
  });

  // 全クライアントに送信
  setInterval(() => {
    io.emit("updateAll", dots);
  }, 50);
});

http.listen(3000, () => {
  console.log("listening on http://localhost:3000");
});
