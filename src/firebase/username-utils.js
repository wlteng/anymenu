import { db } from './config';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';

export const usernameUtils = {
  checkAvailability: async (username) => {
    try {
      const q = query(collection(db, 'shops'), where('username', '==', username));
      const querySnapshot = await getDocs(q);
      return querySnapshot.empty;
    } catch (error) {
      console.error('Error checking username:', error);
      throw error;
    }
  },

  validateFormat: (username) => {
    const isValid = /^[a-zA-Z0-9-_]+$/.test(username);
    if (!isValid) {
      throw new Error('Username can only contain letters, numbers, hyphens, and underscores');
    }
    return true;
  },

  checkMinLength: (username) => {
    if (username.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }
    return true;
  }
};