const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('../client'));

let users = {}; // email -> socket.id

io.on('connection', (socket) => {

    socket.on('join', (email) => {
        users[email] = socket.id;
        io.emit('user list', Object.keys(users));
    });

    socket.on('private message', ({ to, message, from }) => {
        const targetSocket = users[to];
        if (targetSocket) {
            io.to(targetSocket).emit('private message', { message, from });
        }
    });

    socket.on('disconnect', () => {
        for (let email in users) {
            if (users[email] === socket.id) {
                delete users[email];
            }
        }
        io.emit('user list', Object.keys(users));
    });
});

server.listen(3000, '0.0.0.0', () => {
    console.log('Server running on network');
});