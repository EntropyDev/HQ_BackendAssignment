const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const userRouter = require('./routes/user');
const messageRouter = require('./routes/message');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

mongoose.connect('mongodb://localhost/mern-chat', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(cors());
app.use(express.json());
app.use('/api/users', userRouter);
app.use('/api/messages', messageRouter);

let onlineUsers = {};

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('addUser', (userId) => {
    onlineUsers[userId] = socket.id;
    io.emit('getUsers', onlineUsers);
  });

  socket.on('sendMessage', ({ senderId, receiverId, text }) => {
    const user = onlineUsers[receiverId];
    if (user) {
      io.to(user).emit('getMessage', {
        senderId,
        text,
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    for (let [key, value] of Object.entries(onlineUsers)) {
      if (value === socket.id) {
        delete onlineUsers[key];
      }
    }
    io.emit('getUsers', onlineUsers);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
