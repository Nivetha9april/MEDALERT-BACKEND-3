const express = require("express");
const router = express.Router();
const { addMedicine, getMedicines } = require("../controllers/medicine.controller");
const auth = require("../middleware/auth");

router.post("/", auth, addMedicine);
router.get("/", auth, getMedicines);


module.exports = router;
