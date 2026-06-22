import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, ThemeMode } from '@/theme';
import { SettingsScreenProps } from '@/navigation/types';
import { spacing } from '@/constants/spacing';

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { colors, themeMode, setThemeMode } = useTheme();

  const themeOptions: { label: string; value: ThemeMode }[] = [
    { label: 'System', value: 'system' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.optionRow, { backgroundColor: colors.surface }]}
              onPress={() => setThemeMode(option.value)}
            >
              <Text style={[styles.optionText, { color: colors.text }]}>{option.label}</Text>
              {themeMode === option.value && (
                <View style={[styles.checkmark, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Note Editor</Text>
          <View style={[styles.optionRow, { backgroundColor: colors.surface }]}>
            <Text style={[styles.optionText, { color: colors.text }]}>Font Size</Text>
            <Text style={{ color: colors.textSecondary }}>Medium (default)</Text>
          </View>
          <View style={[styles.optionRow, { backgroundColor: colors.surface }]}>
            <Text style={[styles.optionText, { color: colors.text }]}>Font Style</Text>
            <Text style={{ color: colors.textSecondary }}>System</Text>
          </View>
        </View>

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
  title: { fontSize: 28, fontWeight: '700', marginBottom: spacing.xl },
  section: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderRadius: 10, marginBottom: spacing.xs },
  optionText: { fontSize: 16 },
  checkmark: { width: 20, height: 20, borderRadius: 10 },
  aboutText: { fontSize: 13, marginTop: spacing.sm, lineHeight: 18 },
});