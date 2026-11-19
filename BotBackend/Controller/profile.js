const User = require('../Model/signup');

exports.profile = async (req, res) => {
    try {
        console.log("User ID:", req.user.id);

        const userDetail = await User.findById(req.user.id)
            .select("-password")
            .lean();

        console.log("Fetched User:", userDetail);

        if (!userDetail) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "Profile fetched successfully",
            user: userDetail
        });

    } catch (error) {
        console.log("Profile Error:", error);

        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
}; 