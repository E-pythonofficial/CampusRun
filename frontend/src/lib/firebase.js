import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
} from "firebase/messaging";

import api from "@/lib/api";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};


const app = initializeApp(firebaseConfig);


export const messaging =
  typeof window !== "undefined"
    ? getMessaging(app)
    : null;



export async function registerPushToken() {
  try {
    if (!messaging) return null;

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      return null;
    }


    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });


    if (token) {
      await api.post("/push/subscribe", {
        token,
      });
    }


    return token;

  } catch (error) {
    console.error("Push registration failed:", error);
    return null;
  }
}



// Foreground messages
export function listenForMessages(callback) {

  if (!messaging) return;


  onMessage(messaging, (payload) => {
    callback(payload);
  });

}