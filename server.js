const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
app.use(express.static("public"));

let dots = {}; // { id: { x, y, color } }

io.on("connection", (socket) => {
  // 初期化
  dots[socket.id] = { x: 0, y: 0, color: "#0000ff" };
  socket.emit("init", socket.id);
  // 座標の更新
  socket.on("move", (pos) => {
    if (dots[socket.id]) {
      dots[socket.id].x = pos.x;
      dots[socket.id].y = pos.y;
    }
  });

  // 色の更新
  socket.on("color", (color) => {
    if (dots[socket.id]) {
      dots[socket.id].color = color;
    }
  });

  // 切断時に削除
  socket.on("disconnect", () => {
    delete dots[socket.id];
  });

  // 全体送信（ホスト・クライアント共用）
  setInterval(() => {
    const userCount = Object.keys(dots).length;
    io.emit("updateAll", dots, userCount);
  }, 50);
});

http.listen(3000, () => {
  console.log("listening on http://localhost:3000");
});