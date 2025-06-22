const Medicine = require("../models/medicine.model");

exports.addMedicine = async (req, res) => {
  try {
    const medicine = new Medicine({ ...req.body, userId: req.userId });
    await medicine.save();
    res.status(201).json(medicine);
  } catch (err) {
    res.status(500).json({ message: "Error adding medicine", error: err.message });
  }
};


exports.getMedicines = async (req, res) => {
  try {
    const meds = await Medicine.find({ userId: req.userId });
    res.json(meds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
