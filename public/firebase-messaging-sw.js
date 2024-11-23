importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

const firebaseConfig = {
  apiKey: "AIzaSyB4WrwS_RDWo2LruSGBOGdzt-VvGA5vY48",
  authDomain: "dreams-kanakku.firebaseapp.com",
  projectId: "dreams-kanakku",
  storageBucket: "dreams-kanakku.appspot.com",
  messagingSenderId: "425315482543",
  appId: "1:425315482543:web:45966f7200b0bd99f9cd5a",
  measurementId: "G-8253D7HP6M"
};

firebase.initializeApp(firebaseConfig);

let messaging = null;

if (firebase.messaging.isSupported()) {
  messaging = firebase.messaging();
}

messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/favicaon.png",
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
