import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from '@/theme/ThemeContext';

const SETTINGS_KEY = '@lectify/settings';

export interface AppSettings {
  themeMode: ThemeMode;
  fontSize: 'small' | 'medium' | 'large';
  fontStyle: 'system' | 'serif' | 'monospace';
  sortOrder: 'newest' | 'oldest';
}

const defaultSettings: AppSettings = {
  themeMode: 'system',
  fontSize: 'medium',
  fontStyle: 'system',
  sortOrder: 'newest',
};

export const getSettings = async (): Promise<AppSettings> => {
  try {
    const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
    if (jsonValue != null) {
      return { ...defaultSettings, ...JSON.parse(jsonValue) };
    }
    return defaultSettings;
  } catch (e) {
    console.error('Error loading settings:', e);
    return defaultSettings;
  }
};

export const saveSettings = async (settings: Partial<AppSettings>): Promise<void> => {
  try {
    const current = await getSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
};