const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// ✅ Path to temporary key file
const keyPath = path.join(__dirname, "../firebase-admin-key.json");

// ✅ Create key file from Base64 only if it doesn't exist
if (!fs.existsSync(keyPath)) {
  const b64 = process.env.FIREBASE_KEY_BASE64;
  if (!b64) {
    console.error("❌ Missing FIREBASE_KEY_BASE64 in env");
    process.exit(1);
  }

  const jsonString = Buffer.from(b64, "base64").toString("utf8");
  fs.writeFileSync(keyPath, jsonString);
  console.log("✅ firebase-admin-key.json created from Base64");
}

// ✅ Load service account credentials
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));

// ✅ Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ✅ Notification sender
const sendNotification = async (fcmToken, title, body) => {
  if (!fcmToken) {
    console.warn("⚠️ FCM token missing, skipping notification.");
    return;
  }

  const message = {
    token: fcmToken,
    notification: { title, body },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ Notification sent:", response);
    return response;
  } catch (err) {
    console.error("❌ FCM error:", err.message);
  }
};

module.exports = sendNotification;
