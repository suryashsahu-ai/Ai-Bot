const User = require('../Model/signup');
const bcrypt = require('bcryptjs');
const { sendWelcomeEmail } = require('../services/email');

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Input validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }
        const normalizedEmail = String(email).trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Check for duplicate email
        const existEmail = await User.findOne({ email: normalizedEmail });
        if (existEmail) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashPass = await bcrypt.hash(password, 10);
        const user = await User.create({ name: name.trim(), email: normalizedEmail, password: hashPass });

        // Mail delivery is best effort: an SMTP outage must not undo registration.
        sendWelcomeEmail(user).catch((error) => console.error('Welcome email failed:', error.message));

        res.status(201).json({
            message: 'Registered successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('register error:', error.message);
        if (error.code === 11000) {
            return res.status(409).json({ message: 'User already exists' });
        }
        res.status(500).json({ message: 'Unable to complete registration' });
    }
};

module.exports = register;
