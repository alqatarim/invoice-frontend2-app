//import { postData } from "./core/API/api-service";

import firebase from "firebase/compat/app";
import "firebase/compat/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyB4WrwS_RDWo2LruSGBOGdzt-VvGA5vY48",
  authDomain: "dreams-kanakku.firebaseapp.com",
  projectId: "dreams-kanakku",
  storageBucket: "dreams-kanakku.appspot.com",
  messagingSenderId: "425315482543",
  appId: "1:425315482543:web:45966f7200b0bd99f9cd5a",
  measurementId: "G-8253D7HP6M",
};

firebase.initializeApp(firebaseConfig);

let messaging = null;

if (firebase.messaging.isSupported()) {
  messaging = firebase.messaging();
}

const publicKey =
  "BCio5hag3yhIH-xww1SLgakRsC4zlvs5TWfmazbogkf1raJ9JSZW8vPU0xmXIhlRnLhwk6q3u4EiNvoQMwSBPHc";

export const getToken = async (setTokenFound) => {
  let currentToken = "";

  try {
    Notification.requestPermission().then(async () => {});
    currentToken = await messaging.getToken({ vapidKey: publicKey });
    if (currentToken) {
      localStorage.setItem("fcmToken", currentToken);

      setTokenFound(true);
    } else {
      setTokenFound(false);
    }
  } catch (error) {
    //
  }

  return currentToken;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    messaging.onMessage((payload) => {
      resolve(payload);
    });
  });
