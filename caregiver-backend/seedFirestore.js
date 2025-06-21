const { db } = require('./firebaseAdmin');

async function seedRealisticData() {
  try {
    // USERS
    const userRef = await db.collection('users').add({
      name: 'Madhav Jayam',
      email: 'madhav@example.com',
      role: 'caregiver',
      createdAt: new Date(),
      familyId: 'fam001'
    });
    const userId = userRef.id;

    // TASKS
    await db.collection('tasks').add({
      title: 'Give insulin',
      description: 'Dose at 8am before breakfast',
      dueDate: '2025-06-20',
      assignedTo: userId,
      status: 'pending',
      createdAt: new Date()
    });

    // NOTES
    await db.collection('notes').add({
      content: 'Patient had low BP today morning.',
      createdBy: userId,
      timestamp: new Date()
    });

    // FAMILIES
    await db.collection('families').doc('fam001').set({
      familyName: 'Jayam Family',
      members: [userId],
      createdAt: new Date()
    });

    console.log('Data inserted!');
  } catch (err) {
    console.error('Failed to insert data:', err.message);
  }
}

seedRealisticData();
