// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAxh0tIjlxGm1CCtmlhwCyagYQ4MNbnDdo",
  authDomain: "caregiver-coordination-hub.firebaseapp.com",
  projectId: "caregiver-coordination-hub",
  storageBucket: "caregiver-coordination-hub.appspot.com",
  messagingSenderId: "450043180225",
  appId: "1:450043180225:web:6259141b059625484236fe",
  measurementId: "G-YEXL6ZZ4DT"
};


firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Handle background message
});