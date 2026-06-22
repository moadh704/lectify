import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { HomeScreenProps } from '@/navigation/types';
import { spacing } from '@/constants/spacing';
import { getSubjects } from '@/utils/subjectStorage';
import { Subject } from '@/types';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { colors } = useTheme();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Failed to load subjects', error);
    } finally {
      setLoading(false);
    }
  };

  // Reload subjects every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSubjects();
    }, [])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.appName, { color: colors.text }]}>Lectify</Text>
        
        {/* Global Search Bar (UI only for now) */}
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput
            placeholder="Search all notes..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>
      </View>

      {/* Subjects List */}
      <View style={styles.content}>
        {subjects.length > 0 ? (
          <FlatList
            data={subjects}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              // Format date nicely
              const date = new Date(item.updatedAt);
              const formattedDate = date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              });

              return (
                <TouchableOpacity
                  style={[styles.subjectRow, { backgroundColor: colors.surface }]}
                  onPress={() => navigation.navigate('Subject', { 
                    subjectId: item.id, 
                    subjectName: item.name 
                  })}
                >
                  <View style={styles.subjectContent}>
                    <Text style={[styles.subjectName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.subjectMeta, { color: colors.textSecondary }]}>
                      {item.description || 'No description'} • Updated {formattedDate}
                    </Text>
                  </View>
                </TouchableOpacity>
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
        )}
      </View>

      {/* Floating + Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('NewSubject')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
  },
  searchInput: {
    fontSize: 16,
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
});