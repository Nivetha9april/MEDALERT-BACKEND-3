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


// ✅ Add Medicine
exports.addMedicine = async (req, res) => {
  try {
    const medicine = new Medicine({ ...req.body, userId: req.userId });
    await medicine.save();
    res.status(201).json(medicine);
  } catch (err) {
    res.status(500).json({ message: "Error adding medicine", error: err.message });
  }
};

// ✅ Get Medicines for current user
exports.getMedicines = async (req, res) => {
  try {
    const meds = await Medicine.find({ userId: req.userId });
    res.json(meds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update Medicine
exports.updateMedicine = async (req, res) => {
  try {
    const med = await Medicine.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!med) return res.status(404).json({ message: "Medicine not found" });
    res.json(med);
  } catch (err) {
    res.status(500).json({ message: "Error updating medicine", error: err.message });
  }
};

// ✅ Delete Medicine
exports.deleteMedicine = async (req, res) => {
  try {
    const med = await Medicine.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!med) return res.status(404).json({ message: "Medicine not found" });
    res.json({ message: "Medicine deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting medicine", error: err.message });
  }
};
