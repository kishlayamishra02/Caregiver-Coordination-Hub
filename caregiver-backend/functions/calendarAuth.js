// functions/calendarAuth.js
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const credentials = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'credentials.json'))
);
const { client_secret, client_id } = credentials.web;

// 👇 Replace with your Firebase function URL during local dev or deploy
const redirect_uri = 'http://localhost:5001/caregiver-coordination-hub/us-central1/oauthCallback';

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uri
);

function getAuthUrl() {
  const SCOPES = ['https://www.googleapis.com/auth/calendar'];
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // ensures refresh token is returned every time
    redirect_uri
  });
}

module.exports = { oAuth2Client, getAuthUrl };
