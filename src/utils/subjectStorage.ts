import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subject } from '@/types';

const SUBJECTS_KEY = '@lectify/subjects';

/**
 * Subject Data Layer using AsyncStorage
 * All operations are async and persist locally on device.
 */

export const getSubjects = async (): Promise<Subject[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(SUBJECTS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error loading subjects:', e);
    return [];
  }
};

export const saveSubject = async (subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subject> => {
  try {
    const subjects = await getSubjects();
    
    const newSubject: Subject = {
      ...subject,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedSubjects = [newSubject, ...subjects];
    await AsyncStorage.setItem(SUBJECTS_KEY, JSON.stringify(updatedSubjects));
    
    return newSubject;
  } catch (e) {
    console.error('Error saving subject:', e);
    throw e;
  }
};

export const deleteSubject = async (id: string): Promise<void> => {
  try {
    const subjects = await getSubjects();
    const filtered = subjects.filter(s => s.id !== id);
    await AsyncStorage.setItem(SUBJECTS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Error deleting subject:', e);
    throw e;
  }
};

export const updateSubject = async (id: string, updates: Partial<Omit<Subject, 'id' | 'createdAt'>>): Promise<Subject | null> => {
  try {
    const subjects = await getSubjects();
    const index = subjects.findIndex(s => s.id === id);
    
    if (index === -1) return null;

    const updatedSubject = {
      ...subjects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    subjects[index] = updatedSubject;
    await AsyncStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
    
    return updatedSubject;
  } catch (e) {
    console.error('Error updating subject:', e);
    throw e;
  }
};

// Clear all subjects (useful for testing)
export const clearAllSubjects = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SUBJECTS_KEY);
  } catch (e) {
    console.error('Error clearing subjects:', e);
  }
};