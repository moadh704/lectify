import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { SubjectScreenProps } from '@/navigation/types';
import { spacing } from '@/constants/spacing';
import { getSubjects } from '@/utils/subjectStorage';
import { getNotes } from '@/utils/noteStorage';
import { Subject, Note } from '@/types';
import { useFocusEffect } from '@react-navigation/native';
import { useDebounce } from '@/hooks/useDebounce';
import { AnimatedTouchable } from '@/components';

export default function SubjectScreen({ navigation, route }: SubjectScreenProps) {
  const { colors } = useTheme();
  const { subjectId, subjectName } = route.params;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const debouncedLocalQuery = useDebounce(localSearchQuery, 250);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);

  // Load subject + its notes
  const loadData = async () => {
    try {
      const allSubjects = await getSubjects();
      const foundSubject = allSubjects.find(s => s.id === subjectId);
      setSubject(foundSubject || null);

      const subjectNotes = await getNotes(subjectId);
      setNotes(subjectNotes);
      setFilteredNotes(subjectNotes);
    } catch (error) {
      console.error('Failed to load subject data', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [subjectId])
  );

  // Local search within this subject (debounced)
  const handleLocalSearch = (text: string) => {
    setLocalSearchQuery(text);
  };

  // Apply debounced search
  useEffect(() => {
    if (!debouncedLocalQuery.trim()) {
      setFilteredNotes(notes);
      return;
    }
    const lowerQuery = debouncedLocalQuery.toLowerCase();
    const results = notes.filter(note =>
      note.content.toLowerCase().includes(lowerQuery) ||
      (note.title && note.title.toLowerCase().includes(lowerQuery))
    );
    setFilteredNotes(results);
  }, [debouncedLocalQuery, notes]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.subjectName, { color: colors.text }]}>{subject?.name || subjectName}</Text>
        {subject?.description && (
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {subject.description}
          </Text>
        )}
      </View>

      {/* Local Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TextInput
          placeholder="Search notes in this subject..."
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.text }]}
          value={localSearchQuery}
          onChangeText={handleLocalSearch}
        />
        {localSearchQuery.length > 0 && (
          <TouchableOpacity onPress={() => { setLocalSearchQuery(''); setFilteredNotes(notes); }}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notes List */}
      <View style={styles.content}>
        {filteredNotes.length > 0 ? (
          <FlatList
            data={filteredNotes}
            keyExtractor={(item) => item.id}
            removeClippedSubviews={true}
            maxToRenderPerBatch={12}
            windowSize={8}
            renderItem={({ item }) => {
              const date = new Date(item.updatedAt);
              const formattedDate = date.toLocaleDateString('en-US', { 
                month: 'short', day: 'numeric' 
              });

              return (
                <AnimatedTouchable
                  style={[styles.noteRow, { backgroundColor: colors.surface }]}
                  onPress={() => navigation.navigate('NoteEditor', { 
                    noteId: item.id, 
                    subjectId: subjectId 
                  })}
                >
                  <Text style={[styles.noteTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.title || item.content.substring(0, 50)}
                  </Text>
                  <Text style={[styles.noteDate, { color: colors.textSecondary }]}>
                    {formattedDate}
                  </Text>
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {localSearchQuery 
                ? `No notes found for "${localSearchQuery}"` 
                : "No notes yet. Tap + to write one."}
            </Text>
          </View>
        )}
      </View>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('NoteEditor', { subjectId })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  subjectName: {
    fontSize: 22,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    marginTop: 2,
  },
  searchBar: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    height: 44,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: { fontSize: 15, flex: 1 },
  content: { flex: 1, paddingHorizontal: spacing.lg },
  noteRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  noteDate: {
    fontSize: 13,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
});