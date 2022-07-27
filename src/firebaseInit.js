import firebase from "firebase/app";
import "firebase/messaging";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  // apiKey: "AIzaSyAPaJ1rsEy0SiyuJyX1h06VdO-HnPdgQ4g",
  // authDomain: "danapay-dev.firebaseapp.com",
  // databaseURL: "https://danapay-dev.firebaseio.com",
  // projectId: "danapay-dev",
  // storageBucket: "danapay-dev.appspot.com",
  // messagingSenderId: "718718569850",
  // appId: "1:718718569850:web:df1d35944b56e685d45ac3",
  apiKey: "AIzaSyDHIbjaCghgGb7fULtObn7xTA-VQxHvqIo",
  authDomain: "danapay-e472c.firebaseapp.com",
  databaseURL: "https://danapay-e472c.firebaseio.com",
  projectId: "danapay-e472c",
  storageBucket: "danapay-e472c.appspot.com",
  messagingSenderId: "287763234155",
  appId: "1:287763234155:web:3f96e66091d8e9a697602e",
  measurementId: "G-CK9Y43PXRR",
};

firebase.initializeApp(firebaseConfig);
var messaging = null;
if (firebase.messaging.isSupported()) {
  messaging = firebase.messaging();
}

const { REACT_APP_VAPID } = process.env;
const publicKey = REACT_APP_VAPID;

export const getToken = async () => {
  let currentToken = "";
  try {
    currentToken = await messaging?.getToken({ vapidKey: publicKey });
  } catch (error) {}
  return currentToken;
};

const ob = {};

messaging?.onMessage((payload) => {
  if (ob.fn) {
    ob.fn.call(null, payload);
  }
});

export const onMessageListener = () =>
  new Promise((resolve) => {
    messaging?.onMessage((payload) => {
      resolve(payload);
    });
  });

export const setMessageListener = (func) => {
  ob.fn = func;
};
