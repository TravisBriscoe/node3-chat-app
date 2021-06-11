const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMsg, generateLocationMsg } = require('./utils/message');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicStaticPath = path.join(__dirname, '../public');

// let count = 0;

io.on('connection', socket => {
  console.log('New WebSocket connection!');

  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit('message', generateMsg('Admin', 'Welcome!'));
    socket.broadcast
      .to(user.room)
      .emit('message', generateMsg('Admin', `${user.username} has joined!`));

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();

    // socket.emit, io.emit, socket.broadcast.emit
    // io.to.emit, socket.broadcast.to.emit
  });

  socket.on('sendMessage', (msg, callback) => {
    const filter = new Filter();
    if (filter.isProfane(msg)) {
      return callback('Error! Empty message or bad word used!');
    }

    const user = getUser(socket.id);

    io.to(user.room).emit('message', generateMsg(user.username, msg));
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      console.log('WebSocket disconnected!');

      io.to(user.room).emit(
        'message',
        generateMsg('Admin', `${user.username} has left!`)
      );

      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      'locationMessage',
      generateLocationMsg(
        user.username,
        `https://google.com/maps?q=${coords.lat},${coords.lng}`
      )
    );
    callback();
  });
});

app.use(express.static(publicStaticPath));

server.listen(port, () => {
  console.log(`Server bind to port ${port}`);
});
