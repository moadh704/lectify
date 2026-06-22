import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import { lightColors, darkColors, Colors } from '@/constants/colors';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  colors: Colors;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && systemColorScheme === 'dark');

  const colors: Colors = isDark ? darkColors : lightColors;

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (themeMode === 'system') {
      }
    });
    return () => subscription.remove();
  }, [themeMode]);

  const handleSetThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const toggleTheme = () => {
    if (themeMode === 'light') {
      handleSetThemeMode('dark');
    } else if (themeMode === 'dark') {
      handleSetThemeMode('light');
    } else {
      handleSetThemeMode(isDark ? 'light' : 'dark');
    }
  };

  const value: ThemeContextType = {
    colors,
    isDark,
    themeMode,
    setThemeMode: handleSetThemeMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const useColors = (): Colors => {
  const { colors } = useTheme();
  return colors;
};