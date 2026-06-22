import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { SubjectScreenProps } from '@/navigation/types';
import { spacing } from '@/constants/spacing';

export default function SubjectScreen({ navigation, route }: SubjectScreenProps) {
  const { colors } = useTheme();
  const { subjectName } = route.params;

  const placeholderNotes = [
    { id: 'n1', title: 'Lecture 3 - Derivatives', date: 'Jun 20, 10:34am' },
    { id: 'n2', title: 'Midterm Review Notes', date: 'Jun 18, 2:15pm' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.subjectName, { color: colors.text }]}>{subjectName}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Professor • Mon/Wed 9:30am
        </Text>
      </View>

      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TextInput
          placeholder="Search notes in this subject..."
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      <View style={styles.content}>
        {placeholderNotes.length > 0 ? (
          <FlatList
            data={placeholderNotes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.noteRow, { backgroundColor: colors.surface }]}
                onPress={() => navigation.navigate('NoteEditor', { 
                  noteId: item.id, 
                  subjectId: 'demo' 
                })}
              >
                <Text style={[styles.noteTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.noteDate, { color: colors.textSecondary }]}>{item.date}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No notes yet. Tap + to write one.
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('NoteEditor', { subjectId: 'demo' })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  subjectName: { fontSize: 22, fontWeight: '700' },
  description: { fontSize: 14, marginTop: 2 },
  searchBar: { marginHorizontal: spacing.lg, marginBottom: spacing.md, borderRadius: 10, borderWidth: 1, paddingHorizontal: spacing.md, height: 44, justifyContent: 'center' },
  searchInput: { fontSize: 15 },
  content: { flex: 1, paddingHorizontal: spacing.lg },
  noteRow: { paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderRadius: 8, marginBottom: spacing.sm },
  noteTitle: { fontSize: 16, fontWeight: '600' },
  noteDate: { fontSize: 13, marginTop: 4 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, textAlign: 'center' },
  fab: { position: 'absolute', bottom: 30, right: 24, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  fabText: { color: '#FFFFFF', fontSize: 28, fontWeight: '300', marginTop: -2 },
});