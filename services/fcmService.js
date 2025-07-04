const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require(path.join(__dirname, "../firebase-admin-key.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const sendNotification = async (fcmToken, title, body) => {
  if (!fcmToken) {
    console.warn("⚠️ Skipped notification: fcmToken missing.");
    return;
  }

  const message = {
    token: fcmToken,
    notification: { title, body },
  };

  try {
    const res = await admin.messaging().send(message);
    console.log("✅ Sent to", fcmToken);
    return res;
  } catch (err) {
    console.error("❌ FCM error:", err);
  }
};


module.exports = sendNotification;
