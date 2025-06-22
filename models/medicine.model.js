const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  dosage: String,
  quantity: Number,
  frequency: Number, // doses per day
  expiryDate: Date,
  startDate: Date,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Medicine", medicineSchema);
