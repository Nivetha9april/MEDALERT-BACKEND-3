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
    console.log("📧 Login attempt with email:", email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ message: "❌ User not found" });
    }

    console.log("👤 User found:", user);
    console.log("🔐 Entered password:", password);
    console.log("🧂 Stored hash:", user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔍 Password match result:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "❌ Incorrect password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token, user }); // ✅ send both token and user

  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "❌ Login failed", error: err.message });
  }
};

// ✅ Google Login
exports.googleLogin = async (req, res) => {
  try {
    const { email, name, password, phone } = req.body;
    let user = await User.findOne({ email });

    if (user) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      return res.json({ token, user });
    }

    const hash = await bcrypt.hash(password, 10);
    user = new User({ name, email, phone: phone || "0000000000", password: hash });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: "❌ Google login failed", error: err.message });
  }
};

// ✅ Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "❌ Failed to fetch profile", error: err.message });
  }
};

// ✅ Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const updateData = { name, email, phone };
    if (password && password.trim() !== "") {
      const hash = await bcrypt.hash(password, 10);
      updateData.password = hash;
    }

    const updatedUser = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.json({ message: "✅ Profile updated", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "❌ Update failed", error: err.message });
  }
};

// ✅ Save FCM token using userId from token
exports.saveFcmToken = async (req, res) => {
  const { fcmToken } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { fcmToken },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "✅ Token saved." });
  } catch (err) {
    res.status(500).json({ message: "❌ Failed to save token", error: err.message });
  }
};
