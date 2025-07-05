const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const listEndpoints = require("express-list-endpoints");

dotenv.config();

// Routes & Models
const userRoutes = require("./routes/user.routes");
const medicineRoutes = require("./routes/medicine.routes");
const User = require("./models/User");
app.get("/health", (req, res) => {
  res.send("✅ Server is alive and all cron jobs are scheduled.");
});

// Cron Jobs
require("./cron/reminders");
const scheduleRefillReminder = require("./cron/refillReminder");
const scheduleSMSReminder = require("./cron/sendSMS");
const scheduleReduceQuantity = require("./cron/reduceQuantity");

// FCM Notification
const sendNotification = require("./services/fcmService");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/medicines", medicineRoutes);

// Show routes
console.log("📌 Registered Endpoints:");
console.table(listEndpoints(app));

// ✅ Test notification function
async function testNotification() {
  const user = await User.findOne({ fcmToken: { $exists: true, $ne: null } });
  if (!user) {
    console.warn("⚠️ No user with FCM token found.");
    return;
  }
  await sendNotification(user.fcmToken, "💊 MedAlert", "🔔 This is a test notification.");
}

// DB Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/medalert", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB Connected");
    scheduleRefillReminder();
    scheduleSMSReminder();
    scheduleReduceQuantity();

    // ✅ Send a test notification after DB is ready
    testNotification();

    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("❌ DB Connection Failed:", err));
