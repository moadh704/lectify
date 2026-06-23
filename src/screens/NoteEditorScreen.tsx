import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { NoteEditorScreenProps } from '@/navigation/types';
import { spacing } from '@/constants/spacing';

export default function NoteEditorScreen({ navigation, route }: NoteEditorScreenProps) {
  const { colors } = useTheme();
  const { subjectId, noteId } = route.params;

  const [content, setContent] = useState('Start typing your lecture notes here...\n\n• Key concept 1\n• Key concept 2');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Generate dynamic auto-title
  const getAutoTitle = () => {
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const monthDay = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const time = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }).toLowerCase();
    return `${dayName} ${monthDay}, ${time}`;
  };

  const [autoTitle, setAutoTitle] = useState(getAutoTitle());

  // Auto-save every 3 seconds (real persistence in Step 8)
  const autoSaveInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous interval
    if (autoSaveInterval.current) {
      clearInterval(autoSaveInterval.current);
    }

    autoSaveInterval.current = setInterval(() => {
      if (content.trim().length > 0) {
        // TODO: Replace with real note save in Step 8
        console.log('[Auto-save] Saving note content...', content.substring(0, 50) + '...');
        setLastSaved(new Date());
      }
    }, 3000);

    return () => {
      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current);
      }
    };
  }, [content]);

  // Formatting toolbar actions
  const applyBold = () => {
    const newContent = content + '**bold text**';
    setContent(newContent);
  };

  const applyBullet = () => {
    const newContent = content.endsWith('\n') || content === '' 
      ? content + '• ' 
      : content + '\n• ';
    setContent(newContent);
  };

  const applyHeading = () => {
    const newContent = content.endsWith('\n') || content === ''
      ? content + '# Heading\n'
      : content + '\n# Heading\n';
    setContent(newContent);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.back, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => { /* PDF export later */ }}>
            <Text style={[styles.share, { color: colors.primary }]}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={[styles.autoTitle, { color: colors.text }]}>{autoTitle}</Text>
          <Text style={[styles.tapToRename, { color: colors.textSecondary }]}>Tap to rename</Text>
        </View>

        {/* Writing Area - clean and distraction-free */}
        <TextInput
          style={[styles.editor, { 
            color: colors.text,
            backgroundColor: colors.background 
          }]}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          placeholder="Start writing..."
          placeholderTextColor={colors.textSecondary}
        />

        {/* Minimal Formatting Toolbar (pinned above keyboard) */}
        <View style={[styles.toolbar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity style={styles.toolButton} onPress={applyBold}>
            <Text style={[styles.toolText, { color: colors.primary }]}>B</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolButton} onPress={applyBullet}>
            <Text style={[styles.toolText, { color: colors.primary }]}>•</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolButton} onPress={applyHeading}>
            <Text style={[styles.toolText, { color: colors.primary, fontWeight: '700' }]}>H</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1,
  },
  back: { fontSize: 16, fontWeight: '500' },
  share: { fontSize: 16, fontWeight: '500' },
  titleContainer: {
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  autoTitle: {
    fontSize: 18, fontWeight: '600',
  },
  tapToRename: {
    fontSize: 12, marginTop: 2,
  },
  editor: {
    flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md, fontSize: 16, lineHeight: 24,
  },
  toolbar: {
    flexDirection: 'row', paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderTopWidth: 1, justifyContent: 'flex-start', gap: spacing.xl,
  },
  toolButton: {
    padding: spacing.sm,
  },
  toolText: {
    fontSize: 18, fontWeight: '600',
  },
});