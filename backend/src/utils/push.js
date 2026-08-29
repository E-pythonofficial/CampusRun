// utils/push.js

import { initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";


let messaging;


const initializeFirebase = () => {

  if (messaging) return;


  const firebaseJson =
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON;


  if (!firebaseJson) {

    console.warn(
      "⚠️ Firebase credentials missing. Push disabled."
    );

    return;

  }


  const serviceAccount =
    JSON.parse(firebaseJson);



  initializeApp({
    credential: cert(serviceAccount),
  });


  messaging = getMessaging();


  console.log(
    "🔥 Firebase Admin initialized"
  );

};



initializeFirebase();



export const sendPushNotification = async (
  token,
  {
    title,
    body,
    data = {}
  }
)=>{


  if(!messaging){

    console.warn(
      "Push skipped. Firebase not initialized"
    );

    return null;

  }



  try {


    const response =
      await messaging.send({

        token,

        notification:{
          title,
          body
        },

        data

      });


    console.log(
      "✅ Push sent:",
      response
    );


    return response;


  }catch(error){

    console.error(
      "❌ Push error:",
      error.message
    );


    if(
      error.code === 
      "messaging/registration-token-not-registered"
      ||
      error.code ===
      "messaging/invalid-registration-token"
    ){

      return {
        expired:true,
        token
      };

    }


    throw error;

  }

};

export const sendPushToUser = async (
  prisma,
  userId,
  payload
) => {

  const tokens = await prisma.pushToken.findMany({
    where: {
      userId
    }
  });


  for (const tokenRecord of tokens) {

    const result = await sendPushNotification(
      tokenRecord.token,
      payload
    );


    if (result?.expired) {

      await prisma.pushToken.delete({
        where: {
          id: tokenRecord.id
        }
      }).catch(() => {});

    }

  }

};