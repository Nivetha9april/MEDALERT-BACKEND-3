const cron = require("node-cron");
const Medicine = require("../models/medicine.model");
const User = require("../models/User");
const nodemailer = require("nodemailer");

// ✅ Email transporter setup using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Email sender function
const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error("❌ Email sending failed:", err.message);
  }
};

// ✅ Core function to check medicine status and send email reminders
const checkMedicines = async () => {
  const today = new Date();
  const inThreeDays = new Date();
  inThreeDays.setDate(today.getDate() + 3);

  const meds = await Medicine.find({
    $or: [
      { expiryDate: { $lte: inThreeDays } },
      { $expr: { $lte: ["$quantity", { $multiply: ["$frequency", 2] }] } },
    ],
  });

  for (let med of meds) {
    const user = await User.findById(med.userId);
    if (!user) continue;

    let message = `Hi ${user.name},\n\n`;

    if (new Date(med.expiryDate) <= inThreeDays) {
      message += `⚠️ Your medicine "${med.name}" is expiring on ${med.expiryDate.toDateString()}.\n`;
    }

    if (med.quantity <= med.frequency * 2) {
      message += `📦 Your quantity for "${med.name}" is low. Only ${med.quantity} left.\n`;
    }

    message += "\nStay healthy,\n🩺 MedAlert Team";

    await sendEmail(user.email, "💊 Medicine Reminder", message);
  }
};

// 🕘 Schedule job to run every day at 9 AM
function scheduleReminders() {
  cron.schedule("0 9 * * *", checkMedicines);
  console.log("⏰ Cron job scheduled for 9 AM daily.");
}

module.exports = scheduleReminders;
