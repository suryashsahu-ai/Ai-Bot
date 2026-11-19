const axios = require('axios');
const Conversation = require('../Model/Conversation');

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-20b';
const SYSTEM_MESSAGE = {
    role: 'system',
    content: 'You are a helpful AI assistant capable of answering questions on any topic including programming, education, business, digital marketing, SEO, content writing, market research, and general knowledge. Be helpful, accurate, and concise. Do not fabricate real-time data like stock prices or live news.'
};

// POST /api/auth/conversations — create a new conversation
exports.createConversation = async (req, res) => {
    try {
        const { title } = req.body;
        const conversation = await Conversation.create({
            userId: req.user.id,
            title: title || 'New Chat',
            messages: []
        });
        res.status(201).json(conversation);
    } catch (error) {
        console.error('createConversation error:', error.message);
        res.status(500).json({ message: 'Failed to create conversation' });
    }
};

// GET /api/auth/conversations — get all conversations for user
exports.getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({ userId: req.user.id })
            .sort({ updatedAt: -1 })
            .select('_id title createdAt updatedAt');
        res.json(conversations);
    } catch (error) {
        console.error('getConversations error:', error.message);
        res.status(500).json({ message: 'Failed to fetch conversations' });
    }
};

// GET /api/auth/conversations/:id — get single conversation with messages
exports.getConversation = async (req, res) => {
    try {
        const conversation = await Conversation.findOne({
            _id: req.params.id,
            userId: req.user.id
        });
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        res.json(conversation);
    } catch (error) {
        console.error('getConversation error:', error.message);
        res.status(500).json({ message: 'Failed to fetch conversation' });
    }
};

// DELETE /api/auth/conversations/:id — delete conversation
exports.deleteConversation = async (req, res) => {
    try {
        const conversation = await Conversation.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        res.json({ message: 'Conversation deleted successfully' });
    } catch (error) {
        console.error('deleteConversation error:', error.message);
        res.status(500).json({ message: 'Failed to delete conversation' });
    }
};

// POST /api/auth/conversations/:id/messages — send message, call Groq, save and return both messages
exports.sendMessage = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        const conversation = await Conversation.findOne({
            _id: req.params.id,
            userId: req.user.id
        });
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Add user message to conversation
        const userMessage = { role: 'user', content: content.trim() };
        conversation.messages.push(userMessage);

        // Build messages array for Groq (system + full history)
        const groqMessages = [
            SYSTEM_MESSAGE,
            ...conversation.messages.map(m => ({ role: m.role, content: m.content }))
        ];

        if (!process.env.GROQ_API_KEY) {
            return res.status(503).json({
                message: 'AI service is not configured',
                error: 'Add GROQ_API_KEY to the backend environment'
            });
        }

        // Call Groq API
        const groqResponse = await axios.post(
            GROQ_URL,
            {
                model: GROQ_MODEL,
                messages: groqMessages
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const assistantContent = groqResponse.data.choices[0].message.content;

        // Add assistant reply to conversation
        const assistantMessage = { role: 'assistant', content: assistantContent };
        conversation.messages.push(assistantMessage);

        // Auto-set title from first user message if still default
        if (conversation.title === 'New Chat' && conversation.messages.length <= 2) {
            conversation.title = content.trim().slice(0, 60);
        }

        conversation.updatedAt = new Date();
        await conversation.save();

        const savedMessages = conversation.messages;
        const savedUserMsg = savedMessages[savedMessages.length - 2];
        const savedAssistantMsg = savedMessages[savedMessages.length - 1];

        res.json({
            userMessage: savedUserMsg,
            assistantMessage: savedAssistantMsg,
            conversationId: conversation._id
        });

    } catch (error) {
        console.error('sendMessage error:', error.response?.data || error.message);
        res.status(500).json({
            message: 'Failed to get AI response',
            error: 'The AI service is temporarily unavailable'
        });
    }
};
