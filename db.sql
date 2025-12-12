-- Database: minichat

CREATE DATABASE IF NOT EXISTS minichat;
USE minichat;

-- Table for users (optional, if we want persistent users, otherwise we can just use session names)
-- For simplicity and "WA Web" feel, we might just store messages with a sender name.
-- But let's create a messages table.

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
