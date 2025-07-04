const cron = require("node-cron");
const sendNotification = require("../services/fcmService");
const Medicine = require("../models/medicine.model"); // assuming you have one
const User = require("../models/User");

// 🔁 1. 9 AM - Daily reminder
cron.schedule("0 9 * * *", async () => {
  const users = await User.find({ fcmToken: { $exists: true } });
  for (const user of users) {
    await sendNotification(user.fcmToken, "💊 Did you take your medicine?", "Remember to take your pills today!");
  }
});

// 🔁 2. 2 PM - Reminder with medicine names
cron.schedule("0 14 * * *", async () => {
  const users = await User.find({ fcmToken: { $exists: true } });
  for (const user of users) {
    const medicines = await Medicine.find({ userId: user._id });
    const medNames = medicines.map(m => m.name).join(", ");
    await sendNotification(user.fcmToken, "💊 Medicine Reminder", `Take: ${medNames || "your medicines"}`);
  }
});

// 🔁 3. Every 3 hours wellness tip
cron.schedule("0 */3 * * *", async () => {
  const tips = [
    "💧 Stay hydrated!",
    "🍎 Eat a healthy snack!",
    "😌 Breathe in, relax a bit.",
    "🚶‍♀️ Get up and stretch!",
    "🧠 Rest your eyes from screens!"
  ];
  const tip = tips[Math.floor(Math.random() * tips.length)];
  const users = await User.find({ fcmToken: { $exists: true } });
  for (const user of users) {
    await sendNotification(user.fcmToken, "🩺 Health Tip", tip);
  }
});

// 🔁 4. Low Quantity check - Every day at 10 AM
cron.schedule("0 10 * * *", async () => {
  const lowQtyMeds = await Medicine.find({ quantity: { $lt: 3 } });
  for (const med of lowQtyMeds) {
    const user = await User.findById(med.userId);
    if (user?.fcmToken) {
      await sendNotification(user.fcmToken, "⚠️ Low Medicine Alert", `${med.name} is running low. Please restock.`);
    }
  }
});

// 🔁 5. Expiry check - Daily at 11 AM
cron.schedule("0 11 * * *", async () => {
  const today = new Date();
  const upcoming = new Date();
  upcoming.setDate(today.getDate() + 5); // 5 days ahead

  const expiringMeds = await Medicine.find({
    expiryDate: { $lte: upcoming, $gte: today }
  });

  for (const med of expiringMeds) {
    const user = await User.findById(med.userId);
    if (user?.fcmToken) {
      await sendNotification(user.fcmToken, "❗ Expiry Alert", `${med.name} expires in a few days.`);
    }
  }
});
// TEST this block manually (e.g., in a new route or a temporary test script)




