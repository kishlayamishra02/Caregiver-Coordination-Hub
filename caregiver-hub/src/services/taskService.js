import { db } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, doc, query, where, Timestamp, getDoc, deleteDoc } from 'firebase/firestore';

export const createTask = async (taskData) => {
  try {
    if (!taskData.userId) {
      throw new Error('User ID is required to create a task');
    }

    // Ensure required fields exist
    const requiredFields = ['title', 'dueDate'];
    const missingFields = requiredFields.filter(field => !taskData[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Convert dueDate to Timestamp
    const dueDate = taskData.dueDate instanceof Date 
      ? Timestamp.fromDate(taskData.dueDate)
      : taskData.dueDate;

    const taskRef = await addDoc(collection(db, 'tasks'), {
      ...taskData,
      userId: taskData.userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      completed: false,
      dueDate
    });
    
    return taskRef.id;
  } catch (error) {
    console.error('Error creating task:', error);
    throw new Error(`Failed to create task. ${error.message}`);
  }
};

export const getTasks = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required to fetch tasks');
    }
    
    const q = query(collection(db, 'tasks'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      // Convert Timestamp to Date for easier handling
      dueDate: doc.data().dueDate?.toDate ? doc.data().dueDate.toDate() : doc.data().dueDate
    }));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw new Error(`Failed to fetch tasks. ${error.message}`);
  }
};

export const updateTask = async (taskId, updates) => {
  try {
    if (!updates.userId) {
      throw new Error('User ID is required to update task');
    }

    const taskRef = doc(db, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);

    if (!taskDoc.exists()) {
      throw new Error('Task not found');
    }

    // Convert dueDate to Timestamp if provided
    if (updates.dueDate) {
      updates.dueDate = updates.dueDate instanceof Date 
        ? Timestamp.fromDate(updates.dueDate)
        : updates.dueDate;
    }

    await updateDoc(taskRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating task:', error);
    throw new Error(`Failed to update task. ${error.message}`);
  }
};

export const deleteTask = async (taskId) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw new Error(`Failed to delete task. ${error.message}`);
  }
};
