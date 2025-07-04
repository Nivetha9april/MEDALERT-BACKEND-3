const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String, // optional if needed
  createdAt: {
    type: Date,
    default: Date.now
  },
  fcmToken: String,
});

module.exports = mongoose.model("User", userSchema);
