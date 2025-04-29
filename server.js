// install express dan socket.io dulu
// npm install express socket.io

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: { origin: "*" }
});

const PORT = 3000;

let rooms = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinRoom', (room) => {
    socket.join(room);
    if (!rooms[room]) rooms[room] = [];
    rooms[room].push(socket.id);

    // kalau ada 2 orang, mulai game
    if (rooms[room].length === 2) {
      io.to(room).emit('startGame', { starter: rooms[room][0] });
    }
  });

  socket.on('makeMove', ({ room, index, player }) => {
    socket.to(room).emit('opponentMove', { index, player });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (const room in rooms) {
      rooms[room] = rooms[room].filter(id => id !== socket.id);
      if (rooms[room].length === 0) delete rooms[room];
    }
  });
});

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
