importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCLDxrX4YfWsofCGcMevMh2RHx-oqJg7K0",
  authDomain: "campusrun-369a1.firebaseapp.com",
  projectId: "campusrun-369a1",
  messagingSenderId: "606033964267",
  appId: "1:606033964267:web:ac5693f0e48046f70022ae",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icon-192.png',
  });
});