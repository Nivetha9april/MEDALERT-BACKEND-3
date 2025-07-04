const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  register,
  login,
  googleLogin,
  getProfile,
  updateProfile,
  saveFcmToken,
} = require("../controllers/user.controllers");

// ✅ Routes
router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);

router.get("/me", auth, getProfile);
router.put("/updateProfile", auth, updateProfile);

// ✅ FCM Token route (only once)
router.post("/fcm-token", auth, saveFcmToken); // auth recommended to associate token with user

module.exports = router;
