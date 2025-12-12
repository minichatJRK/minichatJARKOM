const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Database Connection
const db = mysql.createPool({
    host: 'localhost',
    user: 'root', // Default phpmyadmin user
    password: '', // Default phpmyadmin password
    database: 'minichat'
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Socket.io Logic
io.on('connection', (socket) => {
    console.log('A user connected');

    // Load old messages
    db.query('SELECT * FROM messages ORDER BY created_at ASC', (err, results) => {
        if (err) throw err;
        socket.emit('load messages', results);
    });

    // Handle new message
    socket.on('chat message', (msg) => {
        const { sender, content } = msg;
        const sql = 'INSERT INTO messages (sender, content) VALUES (?, ?)';
        db.query(sql, [sender, content], (err, result) => {
            if (err) throw err;
            io.emit('chat message', msg);
        });
    });

    socket.on('user join', (username) => {
        io.emit('user join', username);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
