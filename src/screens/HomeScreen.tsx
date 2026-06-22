import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { HomeScreenProps } from '@/navigation/types';
import { spacing } from '@/constants/spacing';

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { colors } = useTheme();

  const placeholderSubjects = [
    { id: '1', name: 'Calculus II', noteCount: 12, lastEdited: 'Jun 20' },
    { id: '2', name: 'Organic Chemistry', noteCount: 7, lastEdited: 'Jun 18' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.appName, { color: colors.text }]}>Lectify</Text>
        
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput
            placeholder="Search all notes..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Subjects</Text>

        {placeholderSubjects.length > 0 ? (
          <FlatList
            data={placeholderSubjects}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.subjectRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
                onPress={() => navigation.navigate('Subject', { 
                  subjectId: item.id, 
                  subjectName: item.name 
                })}
              >
                <View>
                  <Text style={[styles.subjectName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.subjectMeta, { color: colors.textSecondary }]}>
                    {item.noteCount} notes • {item.lastEdited}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No subjects yet. Tap + to create one.
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('NewSubject')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={{ color: colors.primary, fontSize: 14 }}>Settings →</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md },
  appName: { fontSize: 28, fontWeight: '700', marginBottom: spacing.md },
  searchBar: { borderRadius: 12, borderWidth: 1, paddingHorizontal: spacing.md, height: 48, justifyContent: 'center' },
  searchInput: { fontSize: 16 },
  content: { flex: 1, paddingHorizontal: spacing.lg },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: spacing.md },
  subjectRow: { paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderRadius: 8, marginBottom: spacing.sm },
  subjectName: { fontSize: 17, fontWeight: '600' },
  subjectMeta: { fontSize: 13, marginTop: 2 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: 16, textAlign: 'center' },
  fab: { position: 'absolute', bottom: 30, right: 24, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  fabText: { color: '#FFFFFF', fontSize: 28, fontWeight: '300', marginTop: -2 },
  settingsButton: { position: 'absolute', bottom: 30, left: 24, padding: 8 },
});