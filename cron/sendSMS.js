const cron = require("node-cron");
const nodemailer = require("nodemailer");
const twilio = require("twilio");
const dotenv = require("dotenv");
const Medicine = require("../models/medicine.model");
const User = require("../models/User");

dotenv.config();

// 💌 Email setup (Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 📱 Twilio setup
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Send Email Function
const sendEmail = async (to, subject, text) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
};

// Send SMS Function
const sendSMS = async (message, number) => {
  try {
    const msg = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: number, // Must be in +91XXXXXXXXXX format
    });
    console.log("📩 SMS sent:", msg.sid);
  } catch (error) {
    console.error("❌ SMS error:", error.message);
  }
};

// Main Reminder Check
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
      message += `⚠️ Your medicine "${med.name}" is expiring on ${med.expiryDate.toDateString()}\n`;
    }

    if (med.quantity <= med.frequency * 2) {
      message += `📦 Your quantity for "${med.name}" is low. Only ${med.quantity} left.\n`;
    }

    message += "\nStay healthy,\n🩺 MedAlert Team";

    // Send Email
    if (user.email) await sendEmail(user.email, "💊 Medicine Reminder", message);

    // Compose SMS text (shortened)
    let smsText = `Hi ${user.name}, "${med.name}" `;
    if (new Date(med.expiryDate) <= inThreeDays)
      smsText += `expires on ${med.expiryDate.toDateString()}. `;
    if (med.quantity <= med.frequency * 2)
      smsText += `Low qty: ${med.quantity}. `;
    smsText += "– MedAlert";

    // Send SMS
    if (user.phone) await sendSMS(smsText, user.phone);
  }
};

// Run Daily at 9 AM
function scheduleReminders() {
  cron.schedule("0 9 * * *", checkMedicines);
  console.log("⏰ Cron job scheduled for 9 AM daily.");
}

module.exports = scheduleReminders;

// 👉 For immediate testing, uncomment this:
// checkMedicines();
