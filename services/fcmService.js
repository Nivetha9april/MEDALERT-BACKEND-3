const admin = require("firebase-admin");
const path = require("path");
require("dotenv").config();

// ✅ Get full path to service account JSON
const serviceAccountPath = path.resolve(__dirname, "..", process.env.FIREBASE_KEY_PATH);
const serviceAccount = require(serviceAccountPath);

// ✅ Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

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
