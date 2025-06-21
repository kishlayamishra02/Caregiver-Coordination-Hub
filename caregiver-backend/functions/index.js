const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.sendTaskNotifications = functions.pubsub
    .schedule("every 1 minutes")
    .onRun(async (context) => {
      const nowDateStr = new Date()
          .toISOString()
          .split("T")[0]; // e.g., "2025-06-20"

      const snapshot = await db
          .collection("tasks")
          .where("dueDate", "==", nowDateStr)
          .where("status", "==", "pending")
          .get();

      if (snapshot.empty) {
        console.log("No pending tasks for today");
        return null;
      }

      snapshot.forEach(async (doc) => {
        const task = doc.data();
        const userId = task.assignedTo;

        const userSnap = await db.collection("users").doc(userId).get();
        if (!userSnap.exists) {
          console.log("User not found:", userId);
          return;
        }
        const user = userSnap.data();

        // 🔔 Simulate sending notification
        console.log(`Notify ${user.name} about task: ${task.title}`);
        // In real app: trigger push notification, SMS, etc.
      });
      return null;
    });
