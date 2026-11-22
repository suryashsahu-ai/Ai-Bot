
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const rootEnvPath = path.resolve(__dirname, '../.env');

dotenv.config({
    path: fs.existsSync(rootEnvPath)
        ? rootEnvPath
        : path.resolve(__dirname, '.env')
});

const router = require('./routes/signRoutes');
const connectDb = require('./config/db');

const app = express();
const port = process.env.PORT || 8000;

// Allowed frontend URLs

const allowedOrigins = [
    'http://localhost:5173',
    'https://ai-bot-eta-livid.vercel.app'
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.log('Blocked CORS Origin:', origin);
        return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));


// Middleware
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// API routes
app.use('/api/auth', router);

// Error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);

    res.status(500).json({
        message: err.message === 'Origin not allowed by CORS'
            ? 'CORS error: Origin not allowed'
            : 'Internal server error'
    });
});

// Start server
connectDb()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
            console.log('Allowed origins:', allowedOrigins);
        });
    })
    .catch(error => {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    });

