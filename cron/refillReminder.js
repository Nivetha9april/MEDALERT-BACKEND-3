const cron = require("node-cron");
const axios = require("axios"); // to call Fast2SMS API
const Medicine = require("../models/medicine.model");
const User = require("../models/User");
const nodemailer = require("nodemailer");
 // adjust path accordingly

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
};

const sendSMS = async (phone, message) => {
  try {
    const response = await axios.get("https://www.fast2sms.com/dev/bulkV2", {
      params: {
        authorization: process.env.FAST2SMS_API_KEY,  // your Fast2SMS API key in .env
        variables_values: message,
        route: "q",
        numbers: phone,
      },
      headers: {
        "cache-control": "no-cache",
      },
    });
    console.log("SMS sent:", response.data);
  } catch (error) {
    console.error("Failed to send SMS:", error.response ? error.response.data : error.message);
  }
};

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
    if (!user) continue; // safety check
    
    let message = `Hi ${user.name},\n\n`;

    if (new Date(med.expiryDate) <= inThreeDays) {
      message += `⚠️ Your medicine "${med.name}" is expiring on ${med.expiryDate.toDateString()}\n`;
    }

    if (med.quantity <= med.frequency * 2) {
      message += `📦 Your quantity for "${med.name}" is low. Only ${med.quantity} left.\n`;
    }

    message += "\nStay healthy,\n🩺 MedAlert Team";

    // Send email
    await sendEmail(user.email, "💊 Medicine Reminder", message);

    // Send SMS (make a simple SMS-friendly message)
    let smsText = `Hi ${user.name}, Your medicine "${med.name}" `;
    if (new Date(med.expiryDate) <= inThreeDays) smsText += `expires on ${med.expiryDate.toDateString()}. `;
    if (med.quantity <= med.frequency * 2) smsText += `Quantity low: ${med.quantity} left. `;
    smsText += "MedAlert Team";

    await sendSMS(user.phone, smsText); // assume you have `phone` in User schema
  }
};

// 🕘 Schedule to run daily at 9 AM
function scheduleReminders() {
  cron.schedule("0 9 * * *", checkMedicines);
  console.log("⏰ Cron job scheduled for 9 AM daily.");
}

module.exports = scheduleReminders;
