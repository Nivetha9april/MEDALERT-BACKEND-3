const cron = require("node-cron");
const Medicine = require("../models/medicine.model");

function scheduleReduceQuantity() {
  // ⏰ Run daily at 12:01 AM
  cron.schedule("1 0 * * *", async () => {
    console.log("🕐 Running quantity reduction job...");

    const today = new Date();

    try {
      const medicines = await Medicine.find({});

      for (const med of medicines) {
        const start = new Date(med.startDate);
        const expiry = new Date(med.expiryDate);

        if (today >= start && today <= expiry && med.quantity > 0) {
          const newQty = Math.max(0, med.quantity - med.frequency);
          await Medicine.findByIdAndUpdate(med._id, { quantity: newQty });
          console.log(`✅ ${med.name} reduced to ${newQty}`);
        }
      }
    } catch (err) {
      console.error("❌ Error reducing quantity:", err.message);
    }
  });
}

module.exports = scheduleReduceQuantity;
