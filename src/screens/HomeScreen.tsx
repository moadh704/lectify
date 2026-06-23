import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { HomeScreenProps } from '@/navigation/types';
import { spacing } from '@/constants/spacing';
import { getSubjects, deleteSubject } from '@/utils/subjectStorage';
import { getNotes } from '@/utils/noteStorage';
import { Subject, Note } from '@/types';
import { useFocusEffect } from '@react-navigation/native';
import { useDebounce } from '@/hooks/useDebounce';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { AnimatedTouchable } from '@/components';

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { colors } = useTheme();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms debounce
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Multi-select state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Animation for selection bar
  const selectionBarTranslateY = useSharedValue(100);

  const animatedSelectionBarStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: selectionBarTranslateY.value }],
  }));

  // FAB animation
  const fabScale = useSharedValue(0.8);
  const fabOpacity = useSharedValue(0);

  const animatedFabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
    opacity: fabOpacity.value,
  }));

  // Animate FAB on mount
  useEffect(() => {
    fabScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    fabOpacity.value = withTiming(1, { duration: 300 });
  }, []);

  const loadSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Failed to load subjects', error);
    }
  };

  // Perform global search across all notes
  const performGlobalSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const allNotes = await getNotes();
      const allSubjects = await getSubjects();

      const lowerQuery = query.toLowerCase();

      const results = allNotes
        .filter(note => 
          note.content.toLowerCase().includes(lowerQuery) ||
          (note.title && note.title.toLowerCase().includes(lowerQuery))
        )
        .map(note => {
          const subject = allSubjects.find(s => s.id === note.subjectId);
          return {
            ...note,
            subjectName: subject?.name || 'Unknown Subject',
          };
        });

      setSearchResults(results);
    } catch (error) {
      console.error('Search failed', error);
      setSearchResults([]);
    }
  };

  // Reload data when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadSubjects();
    }, [])
  );

  // Trigger search only when debounced value changes
  useEffect(() => {
    if (debouncedSearchQuery) {
      performGlobalSearch(debouncedSearchQuery);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [debouncedSearchQuery]);

  // Handle search input (just update state, actual search is debounced)
  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  // Multi-select helpers
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);

    if (newSelected.size === 0) {
      setIsSelectionMode(false);
    }
  };

  const enterSelectionMode = (id: string) => {
    setIsSelectionMode(true);
    const newSelected = new Set<string>([id]);
    setSelectedIds(newSelected);
    selectionBarTranslateY.value = withTiming(0, { duration: 250 });
  };

  const exitSelectionMode = () => {
    selectionBarTranslateY.value = withTiming(100, { duration: 200 });
    setTimeout(() => {
      setIsSelectionMode(false);
      setSelectedIds(new Set());
    }, 200);
  };

  const deleteSelectedSubjects = async () => {
    if (selectedIds.size === 0) return;

    try {
      await Promise.all(
        Array.from(selectedIds).map(id => deleteSubject(id))
      );
      await loadSubjects();
      exitSelectionMode();
    } catch (error) {
      console.error('Failed to delete subjects', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.appName, { color: colors.text }]}>Lectify</Text>
        
        {/* Global Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput
            placeholder="Search all notes..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); setIsSearching(false); }}>
              <Text style={{ color: colors.primary, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content: Either Search Results or Subject List */}
      <View style={styles.content}>
        {searchQuery.length > 0 ? (
          searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={10}
              renderItem={({ item }) => {
                const date = new Date(item.updatedAt);
                const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                return (
                  <AnimatedTouchable
                    style={[styles.searchResultRow, { backgroundColor: colors.surface }]}
                    onPress={() => navigation.navigate('NoteEditor', { 
                      noteId: item.id, 
                      subjectId: item.subjectId 
                    })}
                  >
                    <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.title || item.content.substring(0, 60)}
                    </Text>
                    <Text style={[styles.resultMeta, { color: colors.textSecondary }]}>
                      {item.subjectName} • {formattedDate}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No results found for "{searchQuery}"
              </Text>
            </View>
          )
        ) : (
          subjects.length > 0 ? (
            <FlatList
              data={subjects}
              keyExtractor={(item) => item.id}
              removeClippedSubviews={true}
              maxToRenderPerBatch={15}
              windowSize={10}
              renderItem={({ item }) => {
                const date = new Date(item.updatedAt);
                const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                return (
                  <AnimatedTouchable
                    style={
                      [
                        styles.subjectRow, 
                        { 
                          backgroundColor: selectedIds.has(item.id) 
                            ? colors.primaryDark 
                            : colors.surface 
                        }
                      ]
                    }
                    onPress={() => {
                      if (isSelectionMode) {
                        toggleSelection(item.id);
                      } else {
                        navigation.navigate('Subject', { 
                          subjectId: item.id, 
                          subjectName: item.name 
                        });
                      }
                    }}
                    onLongPress={() => enterSelectionMode(item.id)}
                  >
                    <View style={styles.subjectContent}>
                      <Text style={[styles.subjectName, { color: colors.text }]}>{item.name}</Text>
                      <Text style={[styles.subjectMeta, { color: colors.textSecondary }]}>
                        {item.description || 'No description'} • Updated {formattedDate}
                      </Text>
                    </View>
                  </AnimatedTouchable>
                );
              }}
              ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No subjects yet. Tap + to create one.
              </Text>
            </View>
          )
        )}
      </View>

      {/* Floating + Button (Animated) */}
      <Animated.View style={animatedFabStyle}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('NewSubject')}
          onPressIn={() => {
            fabScale.value = withSpring(0.9, { damping: 15 });
          }}
          onPressOut={() => {
            fabScale.value = withSpring(1, { damping: 12 });
          }}
          activeOpacity={1}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Multi-select Action Bar (Animated) */}
      <Animated.View 
        style={
          [
            styles.selectionBar, 
            { backgroundColor: colors.surface, borderTopColor: colors.border },
            animatedSelectionBarStyle
          ]
        }
        pointerEvents={isSelectionMode ? 'auto' : 'none'}
      >
        <TouchableOpacity onPress={exitSelectionMode} style={styles.selectionButton}>
          <Text style={{ color: colors.text, fontSize: 16 }}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={deleteSelectedSubjects} 
          style={[styles.deleteButton, { backgroundColor: colors.error }]}
          disabled={!isSelectionMode}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
            Delete ({selectedIds.size})
          </Text>
        </TouchableOpacity>
      </Animated.View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  searchBar: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    height: 48,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    fontSize: 16,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  subjectRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.sm,
  },
  subjectContent: {
    flexDirection: 'column',
  },
  subjectName: {
    fontSize: 17,
    fontWeight: '700',
  },
  subjectMeta: {
    fontSize: 13,
    marginTop: 4,
  },
  searchResultRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.sm,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultMeta: {
    fontSize: 13,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
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
  selectionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderTopWidth: 1,
  },
  selectionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  deleteButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
});