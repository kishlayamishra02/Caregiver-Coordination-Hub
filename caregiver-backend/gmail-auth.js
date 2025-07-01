require('dotenv').config();

const { google } = require('googleapis');
const readline = require('readline');
const { OAuth2 } = google.auth;

// Replace with your credentials
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const oAuth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Step 1: Generate URL and prompt user to visit it
const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.compose'
  ],
  prompt: 'consent'
});

console.log('🔗 Visit this URL to authorize the app:\n', authUrl);

// Step 2: Read the authorization code from the user
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('\nPaste the authorization code here: ', async (code) => {
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    console.log('\n✅ Tokens received successfully!');
    console.log('🔁 Refresh Token:', tokens.refresh_token);
    console.log('🔐 Access Token:', tokens.access_token);

    // Optional: Save tokens securely for future use
    // fs.writeFileSync('tokens.json', JSON.stringify(tokens));

    rl.close();
  } catch (error) {
    console.error('❌ Error retrieving access token:', error.message);
    rl.close();
  }
});