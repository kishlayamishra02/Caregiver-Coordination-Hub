const { auth, db } = require('./firebaseAdmin');

async function registerUser(email, password, role = 'caregiver') {
  try {
    const userRecord = await auth.createUser({
      email,
      password,
    });

    console.log('✅ Auth user created:', userRecord.uid);

    await db.collection('users').doc(userRecord.uid).set({
      email,
      role,
      createdAt: new Date()
    });

    console.log('✅ User added to Firestore');
  } catch (error) {
    console.error('❌ Error registering user:', error.message);
  }
}

registerUser('testuser@example.com', 'test1234');
