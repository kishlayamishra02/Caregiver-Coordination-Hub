import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Only register service worker in production
if (isProduction && 'serviceWorker' in navigator) {
  // Use a relative path to the service worker
  const swUrl = '/firebase-messaging-sw.js';
  
  navigator.serviceWorker.register(swUrl)
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch((err) => {
      console.log('Service Worker registration failed:', err);
    });
}
