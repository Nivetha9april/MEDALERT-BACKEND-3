const express = require("express");
const router = express.Router();

// 👇 Make sure the path and exported functions are correct
const {
  register,
  login,
  googleLogin,
} = require("../controllers/user.controllers"); // ✅ correct filename
const auth = require("../middleware/auth");
const {
  getProfile,
  updateProfile,
} = require("../controllers/user.controllers"); // ✅ correct filename

// ✅ These must be real functions
router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);

router.get("/me", auth, getProfile);
router.put("/updateProfile", auth, updateProfile);

module.exports = router;
