// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDIJw9FcF4JdyLjMLr7yvm4WvCGCCzvxss",
  authDomain: "medalert-61d12.firebaseapp.com",
  projectId: "medalert-61d12",
  storageBucket: "medalert-61d12.appspot.com",
  messagingSenderId: "33503415485",
  appId: "1:33503415485:web:9a4502542cad58c2c47bd4",
  measurementId: "G-3Q7457FZH6"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
