const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
app.use(express.static("public"));

let dots = {}; // { id: { r, theta, color, lastActive } }

// 接続時
io.on("connection", (socket) => {
  // 初期化
  dots[socket.id] = { 
    r: 0, 
    theta: 0, 
    color: "#00aaff",
    lastActive: Date.now()
  };

  // 色の受信
  socket.on("color", (color) => {
    if (dots[socket.id]) {
      dots[socket.id].color = color;
      dots[socket.id].lastActive = Date.now();
    }
  });

  // 位置の受信
  socket.on("move", (pos) => {
    if (dots[socket.id]) {
      dots[socket.id].r = pos.r;
      dots[socket.id].theta = pos.theta;
      dots[socket.id].lastActive = Date.now();
    }
  });

  // 切断時
  socket.on("disconnect", () => {
    delete dots[socket.id];
  });
});

// 定期的に古いユーザーを削除
setInterval(() => {
  const now = Date.now();
  for (const id in dots) {
    if (now - dots[id].lastActive > 5000) { // 5秒以上更新なし
      delete dots[id];
    }
  }
}, 1000);

// 全体の状態をブロードキャスト
setInterval(() => {
  io.emit("updateAll", dots);
}, 50);

http.listen(3000, () => {
  console.log("listening on http://localhost:3000");
});
