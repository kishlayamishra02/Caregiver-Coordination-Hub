// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDYXV-5RNkaATCRk0kZfLQ3NMmPtGw0v8I",
  authDomain: "unity-link-26935.firebaseapp.com",
  projectId: "unity-link-26935",
  storageBucket: "unity-link-26935.appspot.com",
  messagingSenderId: "334131837545",
  appId: "1:334131837545:web:5ffb212835645bc1d500f8",
  measurementId: "G-Z1S2KZTC7Y"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Handle background message
});