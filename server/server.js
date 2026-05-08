const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// STATIC CLIENT FOLDER
app.use(express.static(path.resolve(__dirname, '../client')));

let users = {};

io.on('connection', (socket) => {

    socket.on('join', (email) => {

        users[email] = socket.id;

        io.emit('user list', Object.keys(users));

    });

    socket.on('private message', (msg) => {

        const targetSocket = users[msg.to];

        if (targetSocket) {

            io.to(targetSocket).emit('private message', msg);

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

// INDEX PAGE
app.get('/', (req, res) => {

    res.sendFile(
        path.resolve(__dirname, '../client/index.html')
    );

});

server.listen(3000, () => {

    console.log('Server running on http://localhost:3000');

});