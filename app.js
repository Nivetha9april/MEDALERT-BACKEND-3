const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path"); // ✅ Needed to serve frontend

dotenv.config();

const userRoutes = require("./routes/user.routes");
const medicineRoutes = require("./routes/medicine.routes");

// ✅ Import & rename crons to avoid conflict
const scheduleRefillReminder = require("./cron/refillReminder");
const scheduleSMSReminder = require("./cron/sendSMS");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ API Routes
//app.use("/api/users", userRoutes);
//app.use("/api/medicines", medicineRoutes);
try {
  app.use("/api/users", userRoutes);
} catch (err) {
  console.error("❌ Error in /api/users route:", err);
}

try {
  app.use("/api/medicines", medicineRoutes);
} catch (err) {
  console.error("❌ Error in /api/medicines route:", err);
}

// ✅ Serve frontend static files from `public` (which holds React's dist/)
/*app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});*/
// ✅ Serve frontend static files



// ✅ MongoDB connection and cron setup
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    // ✅ Start background tasks
    scheduleRefillReminder();
    scheduleSMSReminder();

    // ✅ Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));


// Serve static frontend assets
