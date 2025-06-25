const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

if (process.env.FUNCTIONS_EMULATOR) {
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
}
const db = admin.firestore();

function validateFields(obj, requiredFields) {
  const missing = requiredFields.filter(field => !(field in obj));
  if (missing.length > 0) {
    throw new Error('Missing fields: ' + missing.join(', '));
  }
}


// ---------------------- GOOGLE CALENDAR UTILS ------------------------ //

const { getAuthUrl, oAuth2Client } = require('./calendarAuth');
const { google } = require('googleapis');

// Utility: load tokens for user
async function getAuthorizedClient(userId) {
  const doc = await db.collection('calendarTokens').doc(userId).get();
  if (!doc.exists) throw new Error('No calendar tokens found');
  oAuth2Client.setCredentials(doc.data().tokens);
  return google.calendar({ version: 'v3', auth: oAuth2Client });
}

// ---------------------- TASK FUNCTIONS ------------------------ //

exports.createTask = functions.https.onRequest(async (req, res) => {
  try {
    const { title, due, assignedTo, status = 'pending', notes = '' } = req.body;

    // 🔍 Validate required fields
    validateFields(req.body, ['title', 'due', 'assignedTo']);

    const newTask = { title, due, assignedTo, status, notes };
    const docRef = await db.collection('tasks').add(newTask);

    // 🔐 Google Calendar requires OAuth token (frontend must handle auth)
    const calendar = await getAuthorizedClient(assignedTo);
    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: title,
        description: notes,
        start: { date: due },
        end: { date: due },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 30 },
            { method: 'email', minutes: 60 }
          ]
        }
      },
    });

    await docRef.update({ eventId: event.data.id });
    res.status(201).send({ message: 'Task and calendar event created', taskId: docRef.id });

  } catch (err) {
    console.error('createTask error:', err.message);
    res.status(400).send(err.message); // ⛑ Send validation or calendar error
  }
});



eexports.getTasks = functions.https.onRequest(async (req, res) => {
  const { assignedTo } = req.query;
  try {
    let query = db.collection('tasks');
    if (assignedTo) {
      query = query.where('assignedTo', '==', assignedTo);
    }

    const snapshot = await query.get();
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.send(tasks);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


exports.updateTask = functions.https.onRequest(async (req, res) => {
  try {
    validateFields(req.body, ['taskId', 'updates']);

    const { taskId, updates } = req.body;
    const taskRef = db.collection('tasks').doc(taskId);
    const doc = await taskRef.get();

    if (!doc.exists) return res.status(404).send('Task not found');
    const task = doc.data();

    await taskRef.update(updates);

    if (task.eventId) {
      const calendar = await getAuthorizedClient(task.assignedTo);
      await calendar.events.patch({
        calendarId: 'primary',
        eventId: task.eventId,
        requestBody: {
          summary: updates.title || task.title,
          description: updates.notes || task.notes,
          start: { date: updates.due || task.due },
          end: { date: updates.due || task.due },
        },
      });
    }

    res.send({ message: 'Task and calendar event updated' });

  } catch (err) {
    console.error('updateTask error:', err.message);
    res.status(400).send(err.message);
  }
});


exports.deleteTask = functions.https.onRequest(async (req, res) => {
  const { taskId } = req.body;
  if (!taskId) return res.status(400).send('Missing taskId');
  try {
    const taskRef = db.collection('tasks').doc(taskId);
    const doc = await taskRef.get();
    if (!doc.exists) return res.status(404).send('Task not found');
    const task = doc.data();

    await taskRef.delete();

    // Delete calendar event
    if (task.eventId) {
      const calendar = await getAuthorizedClient(task.assignedTo);
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: task.eventId,
      });
    }

    res.send({ message: 'Task and calendar event deleted' });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ---------------------- FAMILY FUNCTIONS ------------------------ //

exports.createFamily = functions.https.onRequest(async (req, res) => {
  const { familyName, members = [] } = req.body;
  if (!familyName) return res.status(400).send('Missing familyName');

  try {
    const docRef = await db.collection('families').add({ familyName, members });
    res.status(201).send({ message: 'Family created', familyId: docRef.id });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

exports.getFamily = functions.https.onRequest(async (req, res) => {
  const { familyId } = req.query;
  if (!familyId) return res.status(400).send('Missing familyId');

  try {
    const doc = await db.collection('families').doc(familyId).get();
    if (!doc.exists) return res.status(404).send('Family not found');
    res.send({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

eexports.addFamilyMember = functions.https.onRequest(async (req, res) => {
  try {
    validateFields(req.body, ['familyId', 'userId']);
    const { familyId, userId } = req.body;

    const familyRef = db.collection('families').doc(familyId);
    await familyRef.update({
      members: admin.firestore.FieldValue.arrayUnion(userId),
    });

    res.send({ message: 'Member added to family' });

  } catch (err) {
    console.error('addFamilyMember error:', err.message);
    res.status(400).send(err.message);
  }
});


exports.removeFamilyMember = functions.https.onRequest(async (req, res) => {
  const { familyId, userId } = req.body;
  if (!familyId || !userId) return res.status(400).send('Missing familyId or userId');

  try {
    const familyRef = db.collection('families').doc(familyId);
    await familyRef.update({
      members: admin.firestore.FieldValue.arrayRemove(userId),
    });
    res.send({ message: 'Member removed from family' });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ---------------------- GOOGLE CALENDAR AUTH ------------------------ //

exports.getGoogleAuthUrl = functions.https.onRequest((req, res) => {
  const url = getAuthUrl();
  res.send({ authUrl: url });
});

exports.oauthCallback = functions.https.onRequest(async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing auth code');

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    const userId = 'demo-user-id'; // 🔁 Replace with real Firebase Auth UID

    await db.collection('calendarTokens').doc(userId).set({
      tokens,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.send('Google Calendar authorization successful. You can close this tab.');
  } catch (err) {
    console.error('OAuth callback failed:', err.message);
    res.status(500).send('OAuth Error: ' + err.message);
  }
});


exports.syncCalendarToFirestore = functions.https.onRequest(async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).send('Missing userId');

  try {
    const calendar = await getAuthorizedClient(userId);

    const now = new Date().toISOString();
    const { data } = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now,
      maxResults: 20,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const batch = db.batch();

    for (const event of data.items) {
      const taskRef = db.collection('syncedEvents').doc(event.id); // Use event ID as doc ID
      batch.set(taskRef, {
        title: event.summary || 'No Title',
        notes: event.description || '',
        due: event.start.date || event.start.dateTime || '',
        userId,
        calendarEvent: true,
        lastSynced: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    await batch.commit();
    res.send({ message: `${data.items.length} events synced to Firestore.` });
  } catch (err) {
    console.error('Calendar sync error:', err);
    res.status(500).send(err.message);
  }
});

// ---------------------- SCHEDULED SYNC FUNCTION ------------------------ //

exports.syncCalendarHourly = functions.pubsub.schedule('every 60 minutes').onRun(async (context) => {
  try {
    const snapshot = await db.collection('calendarTokens').get();

    const syncResults = [];

    for (const doc of snapshot.docs) {
      const userId = doc.id;
      try {
        const calendar = await getAuthorizedClient(userId);

        const now = new Date().toISOString();
        const { data } = await calendar.events.list({
          calendarId: 'primary',
          timeMin: now,
          maxResults: 20,
          singleEvents: true,
          orderBy: 'startTime',
        });

        const batch = db.batch();
        for (const event of data.items) {
          const taskRef = db.collection('syncedEvents').doc(event.id);
          batch.set(taskRef, {
            title: event.summary || 'No Title',
            notes: event.description || '',
            due: event.start.date || event.start.dateTime || '',
            userId,
            calendarEvent: true,
            lastSynced: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        await batch.commit();
        syncResults.push({ userId, count: data.items.length });

      } catch (err) {
        console.error(`Error syncing user ${userId}:`, err.message);
      }
    }

    console.log('Sync complete:', syncResults);
    return null;
  } catch (err) {
    console.error('Scheduled sync failed:', err.message);
    throw err;
  }
});

// ---------------------- DASHBOARD API ------------------------ //

exports.getDashboardItems = functions.https.onRequest(async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).send('Missing userId');

  try {
    const tasksSnap = await db.collection('tasks')
      .where('assignedTo', '==', userId).get();

    const eventsSnap = await db.collection('syncedEvents')
      .where('userId', '==', userId).get();

    const tasks = tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), source: 'task' }));
    const events = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), source: 'calendar' }));

    const combined = [...tasks, ...events];

    combined.sort((a, b) => new Date(a.due) - new Date(b.due));

    res.send(combined);
  } catch (err) {
    console.error('getDashboardItems error:', err.message);
    res.status(500).send(err.message);
  }
});


// ---------------------- TASK REMINDER SCHEDULER ------------------------ //

exports.sendTaskReminders = functions.pubsub.schedule('every 60 minutes').onRun(async (context) => {
  const now = new Date();
  const upcoming = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour ahead

  // Format as YYYY-MM-DD to match how due dates are stored
  const today = now.toISOString().split('T')[0];
  const soon = upcoming.toISOString().split('T')[0];

  try {
    const snapshot = await db.collection('tasks')
      .where('due', '>=', today)
      .where('due', '<=', soon)
      .get();

    for (const doc of snapshot.docs) {
      const task = doc.data();
      const { title, due, notes, assignedTo } = task;

      // 🔄 FRONTEND SHOULD:
      // - Use Firebase Messaging to get FCM token on login/init
      // - Then call backend API to save it to: db.collection('fcmTokens').doc(userId).set({ token })
      const tokenDoc = await db.collection('fcmTokens').doc(assignedTo).get();
      if (!tokenDoc.exists || !tokenDoc.data().token) continue;

      const payload = {
        notification: {
          title: `⏰ Reminder: ${title}`,
          body: `Due on ${due}${notes ? ` — ${notes}` : ''}`
        },
        token: tokenDoc.data().token
      };

      try {
        await messaging.send(payload);
        console.log(`Reminder sent to ${assignedTo} for task: ${title}`);
      } catch (err) {
        console.error(`Failed to send reminder for "${title}":`, err.message);
      }
    }
  } catch (err) {
    console.error(' Task reminder scan failed:', err.message);
  }

  return null;
});

async function addNote(familyId, content, createdBy) {
  await db.collection('families').doc(familyId)
    .collection('notes').add({
      content,
      createdBy,
      timestamp: new Date()
    });
}

async function addMessage(familyId, text, senderId) {
  await db.collection('families').doc(familyId)
    .collection('messages').add({
      text,
      senderId,
      timestamp: new Date()
    });
}

exports.sendMessage = functions.https.onRequest(async (req, res) => {
  try {
    const { familyId, senderId, text } = req.body;

    if (!familyId || !senderId || !text) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    await db.collection("families").doc(familyId)
      .collection("messages").add({
        senderId,
        text,
        timestamp: new Date()
      });

    res.status(200).send({ message: "Message sent" });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});


exports.getMessages = functions.https.onRequest(async (req, res) => {
  try {
    const familyId = req.query.familyId;
    if (!familyId) {
      return res.status(400).send({ error: "Missing familyId" });
    }

    const snapshot = await db.collection("families").doc(familyId)
      .collection("messages")
      .orderBy("timestamp", "desc")
      .limit(50)
      .get();

    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).send(messages);
  } catch (err) {
    console.error("Error getting messages:", err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

