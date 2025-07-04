const express = require("express");
const router = express.Router();
const {
  addMedicine,
  getMedicines,
  updateMedicine,  // ✅ newly added
  deleteMedicine   // ✅ newly added
} = require("../controllers/medicine.controller");

const auth = require("../middleware/auth");

// Existing routes
router.post("/", auth, addMedicine);
router.get("/", auth, getMedicines);

// ✅ New routes for Edit & Delete
router.put("/:id", auth, updateMedicine);     // Edit medicine by ID
router.delete("/:id", auth, deleteMedicine);  // Delete medicine by ID

module.exports = router;
