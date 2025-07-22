// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyC_-o9KNjA7jbvU57q7hcEm1tQnUJa-XEc",
    authDomain: "inventoryhomeapp.firebaseapp.com",
    projectId: "inventoryhomeapp",
    storageBucket: "inventoryhomeapp.firebasestorage.app",
    messagingSenderId: "247687436276",
    appId: "1:247687436276:web:4c3c618fd4be354a62cba1",
    measurementId: "G-GVD0NRD99Y"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: "/firebase-logo.png"
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
