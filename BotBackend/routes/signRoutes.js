const express = require("express");

const register = require("../Controller/register");
const { chat } = require("../Controller/chat");
const login = require("../Controller/Login");
const auth = require("../Middleware/auth");
const { profile } = require("../Controller/profile");
const {
    createConversation,
    getConversations,
    getConversation,
    deleteConversation,
    sendMessage
} = require("../Controller/conversation");

const router = express.Router();

router.get('/', (req, res) => {
    res.send("Hello from server");
});

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.get("/profile", auth, profile);

// Simple chat (no auth, no history saved)
router.post('/chat', chat);

// Conversation routes (require auth)
router.post('/conversations', auth, createConversation);
router.get('/conversations', auth, getConversations);
router.get('/conversations/:id', auth, getConversation);
router.delete('/conversations/:id', auth, deleteConversation);
router.post('/conversations/:id/messages', auth, sendMessage);

module.exports = router;
