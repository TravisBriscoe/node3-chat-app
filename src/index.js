const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMsg, generateLocationMsg } = require('./utils/message');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicStaticPath = path.join(__dirname, '../public');

// let count = 0;

io.on('connection', socket => {
  console.log('New WebSocket connection!');

  socket.emit('message', generateMsg('Welcome!'));
  socket.broadcast.emit('message', generateMsg('a new user has joined'));
  // socket.emit('countUpdated', count);

  // socket.on('increment', () => {
  //   count++;
  //   io.emit('countUpdated', count);
  // });
  socket.on('sendMessage', (msg, callback) => {
    const filter = new Filter();
    if (filter.isProfane(msg) || msg === '') {
      return callback('Error! Empty message or bad word used!');
    }

    io.emit('message', generateMsg(msg));
    callback();
  });

  socket.on('disconnect', () => {
    console.log('WebSocket disconnected!');
    io.emit('message', generateMsg('A user has left!'));
  });

  socket.on('sendLocation', (coords, callback) => {
    io.emit(
      'locationMessage',
      generateLocationMsg(
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
