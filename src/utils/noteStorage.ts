import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from '@/types';

const NOTES_KEY = '@lectify/notes';

/**
 * Note Data Layer using AsyncStorage
 * Notes are stored globally but filtered by subjectId when needed.
 */

export const getNotes = async (subjectId?: string): Promise<Note[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(NOTES_KEY);
    let notes: Note[] = jsonValue != null ? JSON.parse(jsonValue) : [];

    if (subjectId) {
      notes = notes.filter(note => note.subjectId === subjectId);
    }

    // Sort by updatedAt descending (newest first)
    return notes.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (e) {
    console.error('Error loading notes:', e);
    return [];
  }
};

export const saveNote = async (
  noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<Note> => {
  try {
    const allNotes = await getAllNotesRaw();
    
    const now = new Date().toISOString();

    if (noteData.id) {
      // Update existing note
      const index = allNotes.findIndex(n => n.id === noteData.id);
      if (index !== -1) {
        allNotes[index] = {
          ...allNotes[index],
          ...noteData,
          updatedAt: now,
        };
        await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(allNotes));
        return allNotes[index];
      }
    }

    // Create new note
    const newNote: Note = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      subjectId: noteData.subjectId,
      title: noteData.title || 'Untitled Note',
      content: noteData.content || '',
      createdAt: now,
      updatedAt: now,
    };

    const updatedNotes = [newNote, ...allNotes];
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
    
    return newNote;
  } catch (e) {
    console.error('Error saving note:', e);
    throw e;
  }
};

// Internal helper to get all notes without sorting/filtering
const getAllNotesRaw = async (): Promise<Note[]> => {
  const jsonValue = await AsyncStorage.getItem(NOTES_KEY);
  return jsonValue != null ? JSON.parse(jsonValue) : [];
};

export const deleteNote = async (id: string): Promise<void> => {
  try {
    const allNotes = await getAllNotesRaw();
    const filtered = allNotes.filter(n => n.id !== id);
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Error deleting note:', e);
    throw e;
  }
};

export const updateNote = async (
  id: string, 
  updates: Partial<Omit<Note, 'id' | 'createdAt'>> 
): Promise<Note | null> => {
  try {
    const allNotes = await getAllNotesRaw();
    const index = allNotes.findIndex(n => n.id === id);
    
    if (index === -1) return null;

    const updatedNote: Note = {
      ...allNotes[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    allNotes[index] = updatedNote;
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(allNotes));
    
    return updatedNote;
  } catch (e) {
    console.error('Error updating note:', e);
    throw e;
  }
};

// Get a single note by ID
export const getNoteById = async (id: string): Promise<Note | null> => {
  try {
    const allNotes = await getAllNotesRaw();
    return allNotes.find(n => n.id === id) || null;
  } catch (e) {
    console.error('Error getting note:', e);
    return null;
  }
};