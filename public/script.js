const socket = io();

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const appContainer = document.querySelector('.app-container');
const usernameInput = document.getElementById('username-input');
const joinBtn = document.getElementById('join-btn');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const messagesContainer = document.getElementById('messages');
const userList = document.getElementById('user-list');

let username = '';

// Join Chat
joinBtn.addEventListener('click', () => {
    username = usernameInput.value.trim();
    if (username) {
        loginScreen.style.display = 'none';
        appContainer.style.display = 'flex';
        socket.emit('user join', username);
    }
});

// Send Message
function sendMessage() {
    const content = messageInput.value.trim();
    if (content && username) {
        const msg = { sender: username, content };
        socket.emit('chat message', msg);
        messageInput.value = '';
    }
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Receive Messages
socket.on('chat message', (msg) => {
    appendMessage(msg);
});

// Load Old Messages
socket.on('load messages', (msgs) => {
    msgs.forEach(msg => appendMessage(msg));
});

function appendMessage(msg) {
    const div = document.createElement('div');
    const isMe = msg.sender === username;

    div.classList.add('message');
    div.classList.add(isMe ? 'sent' : 'received');

    div.innerHTML = `
        <span class="sender-name">${msg.sender}</span>
        ${msg.content}
    `;

    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// User Join (Simplistic implementation)
socket.on('user join', (user) => {
    // In a real app we would maintain a list, here we just show a system message or add to list
    const div = document.createElement('div');
    div.classList.add('user-item');
    div.textContent = user;
    userList.appendChild(div);
});
