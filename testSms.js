require('dotenv').config();
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendTestSMS(to, message) {
  try {
    const msg = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to, // your verified personal number, e.g. '+919876543210'
    });
    console.log('Message sent! SID:', msg.sid);
  } catch (error) {
    console.error('Error sending SMS:', error.message);
  }
}

// Replace with your personal number to test
sendTestSMS('+917338949603', 'Hello from MedAlert using Twilio!');
