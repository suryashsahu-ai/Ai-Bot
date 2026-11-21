const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const rootEnvPath = path.resolve(__dirname, '../.env');
dotenv.config({
    path: fs.existsSync(rootEnvPath) ? rootEnvPath : path.resolve(__dirname, '.env')
});

const router = require('./routes/signRoutes');
const connectDb = require('./config/db');

const app = express();
const port = process.env.PORT || 8000;
const allowedOrigins = (process.env.FrontendUrl || process.env.FrontendUrl|| 'https://ai-bot-6ywf.vercel.app')
    .split(',').map((origin) => origin.trim()).filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Origin is not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/auth', router);

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
});

connectDb()
    .then(() => app.listen(port, () => console.log(`Server listening on port ${port}`)))
    .catch((error) => {
        console.error('Server startup failed:', error.message);
        process.exit(1);
    });
