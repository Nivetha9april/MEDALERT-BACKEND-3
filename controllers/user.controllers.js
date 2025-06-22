const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ Standard Registration
exports.register = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, phone, password: hash });
    await user.save();

    res.json({ message: "✅ Registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "❌ Registration failed", error: err.message });
  }
};

// ✅ Standard Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "❌ User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "❌ Incorrect password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "❌ Login failed", error: err.message });
  }
};

// ✅ Google OAuth Login
exports.googleLogin = async (req, res) => {
  try {
    const { email, name, password, phone } = req.body;
    console.log("Google Login Payload:", req.body); // ✅ log it

    if (!email || !name || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const hash = await bcrypt.hash(password, 10);

      user = new User({
        name,
        email,
        password: hash,
        phone: phone || "0000000000",
      });

      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token, user });
  } catch (err) {
    console.error("Google Login Error:", err.message);
    res.status(500).json({ message: "Google login failed", error: err.message });
  }
};
// ✅ Get Logged-in User Details
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile", error: err.message });
  }
};

// ✅ Update Logged-in User Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const updateData = { name, email, phone };

    // Optional: update password if provided
    if (password && password.trim() !== "") {
      const hash = await bcrypt.hash(password, 10);
      updateData.password = hash;
    }

    const updatedUser = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "✅ Profile updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "❌ Update failed", error: err.message });
  }
};
