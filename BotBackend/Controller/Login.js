
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Model/signup");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate input
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // 2. Find user
        const user = await User.findOne({ email: String(email).trim().toLowerCase() });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // 3. Compare password
        const isPass = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPass) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // 4. Generate JWT
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // 5. Send response
        return res.status(200).json({
            message: "Login successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports=login
