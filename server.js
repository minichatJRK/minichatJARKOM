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
    host: process.env.MYSQLHOST || 'localhost',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || '',
    database: process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || 'minichat',
    port: process.env.MYSQLPORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Auto-create table if it doesn't exist
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

// Helper to keep connection alive or handle disconnects
function handleDisconnect() {
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to Db:', err);
            setTimeout(handleDisconnect, 2000);
        } else {
            console.log('Connected to Database');
            connection.query(createTableQuery, (err) => {
                if (err) console.error('Error creating table:', err);
                else console.log('Table "messages" checked/created.');
                connection.release();
            });
        }
    });
}
handleDisconnect();

// Socket.io Logic
io.on('connection', (socket) => {
    console.log('A user connected');

    // Load old messages
    const sqlLoad = 'SELECT * FROM messages ORDER BY created_at ASC';
    db.query(sqlLoad, (err, results) => {
        if (err) {
            console.error(err);
            return;
        }
        socket.emit('load messages', results);
    });

    // Handle new message
    socket.on('chat message', (msg) => {
        const { sender, content } = msg;
        const sqlInsert = 'INSERT INTO messages (sender, content) VALUES (?, ?)';
        db.query(sqlInsert, [sender, content], (err, result) => {
            if (err) {
                console.error(err);
                return;
            }
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
