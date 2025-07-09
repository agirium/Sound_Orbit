const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
app.use(express.static("public")); // 公開ディレクトリ

let dots = {}; // { id: { r, theta, color } }

io.on("connection", (socket) => {
  // 初期状態の登録（仮の値）
  dots[socket.id] = {
    r: 0.5,
    theta: 0,
    color: "#00aaff"
  };

  // クライアントから位置を受信
  socket.on("move", (pos) => {
    if (dots[socket.id]) {
      dots[socket.id].r = pos.r;
      dots[socket.id].theta = pos.theta;
    }
  });

  // 色の変更を受信
  socket.on("color", (color) => {
    if (dots[socket.id]) {
      dots[socket.id].color = color;
    }
  });

  // 切断時に削除
  socket.on("disconnect", () => {
    delete dots[socket.id];
  });

  // 自身の ID を通知
  socket.emit("init", socket.id);
});

// 全クライアントに 20fps でデータ送信
setInterval(() => {
  io.emit("updateAll", dots);
}, 50);

http.listen(3000, () => {
  console.log("listening on http://localhost:3000");
});
