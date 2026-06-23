import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, ThemeMode } from '@/theme';
import { SettingsScreenProps } from '@/navigation/types';
import { spacing } from '@/constants/spacing';
import { getSettings, saveSettings, AppSettings } from '@/utils/settingsStorage';

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { colors, themeMode, setThemeMode } = useTheme();
  const [settings, setSettings] = useState<AppSettings>({
    themeMode: 'system',
    fontSize: 'medium',
    fontStyle: 'system',
    sortOrder: 'newest',
  });

  useEffect(() => {
    const load = async () => {
      const saved = await getSettings();
      setSettings(saved);
      if (saved.themeMode !== themeMode) {
        setThemeMode(saved.themeMode);
      }
    };
    load();
  }, []);

  const updateSetting = async (key: keyof AppSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);

    if (key === 'themeMode') {
      setThemeMode(value);
    }
  };

  const themeOptions: { label: string; value: ThemeMode }[] = [
    { label: 'System', value: 'system' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ];

  const fontSizeOptions: { label: string; value: AppSettings['fontSize'] }[] = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' },
  ];

  const fontStyleOptions: { label: string; value: AppSettings['fontStyle'] }[] = [
    { label: 'System', value: 'system' },
    { label: 'Serif', value: 'serif' },
    { label: 'Monospace', value: 'monospace' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.optionRow, { backgroundColor: colors.surface }]}
              onPress={() => updateSetting('themeMode', option.value)}
            >
              <Text style={[styles.optionText, { color: colors.text }]}>{option.label}</Text>
              {themeMode === option.value && (
                <View style={[styles.checkmark, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Font Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Note Editor</Text>
          
          <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Font Size</Text>
          {fontSizeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.optionRow, { backgroundColor: colors.surface }]}
              onPress={() => updateSetting('fontSize', option.value)}
            >
              <Text style={[styles.optionText, { color: colors.text }]}>{option.label}</Text>
              {settings.fontSize === option.value && (
                <View style={[styles.checkmark, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          ))}

          <Text style={[styles.subLabel, { color: colors.textSecondary, marginTop: spacing.md }]}>Font Style</Text>
          {fontStyleOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.optionRow, { backgroundColor: colors.surface }]}
              onPress={() => updateSetting('fontStyle', option.value)}
            >
              <Text style={[styles.optionText, { color: colors.text }]}>{option.label}</Text>
              {settings.fontStyle === option.value && (
                <View style={[styles.checkmark, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          <View style={[styles.optionRow, { backgroundColor: colors.surface }]}>
            <Text style={[styles.optionText, { color: colors.text }]}>Lectify</Text>
            <Text style={{ color: colors.textSecondary }}>v1.0.0</Text>
          </View>
          <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
            A clean, minimal, distraction-free note-taking app built for college students.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.xs,
  },
  optionText: {
    fontSize: 16,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  aboutText: {
    fontSize: 13,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
});