import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { NoteEditorScreenProps } from '@/navigation/types';
import { spacing } from '@/constants/spacing';
import { saveNote, getNoteById, updateNote } from '@/utils/noteStorage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function NoteEditorScreen({ navigation, route }: NoteEditorScreenProps) {
  const { colors } = useTheme();
  const { subjectId, noteId: initialNoteId } = route.params;

  const [content, setContent] = useState('');
  const [currentNoteId, setCurrentNoteId] = useState<string | undefined>(initialNoteId);
  const [isSaving, setIsSaving] = useState(false);

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

  const [autoTitle] = useState(getAutoTitle());

  // Load existing note if editing
  useEffect(() => {
    const loadNote = async () => {
      if (initialNoteId) {
        const existingNote = await getNoteById(initialNoteId);
        if (existingNote) {
          setContent(existingNote.content);
          setCurrentNoteId(existingNote.id);
        }
      } else {
        setContent('');
      }
    };
    loadNote();
  }, [initialNoteId]);

  // Auto-save every 3 seconds
  const autoSaveInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoSaveInterval.current) {
      clearInterval(autoSaveInterval.current);
    }

    autoSaveInterval.current = setInterval(async () => {
      if (content.trim().length > 0 && !isSaving) {
        await performAutoSave();
      }
    }, 3000);

    return () => {
      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current);
      }
    };
  }, [content, currentNoteId, isSaving]);

  const performAutoSave = async () => {
    if (!content.trim()) return;

    setIsSaving(true);
    try {
      if (currentNoteId) {
        await updateNote(currentNoteId, { content });
      } else {
        const newNote = await saveNote({
          subjectId,
          content,
          title: autoTitle,
        });
        setCurrentNoteId(newNote.id);
      }
      console.log('[Auto-save] Note saved successfully');
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // PDF Export using expo-print + expo-sharing
  const exportToPDF = async () => {
    if (!content.trim()) {
      Alert.alert('Nothing to export', 'Please write some content first.');
      return;
    }

    try {
      let htmlContent = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^\• (.*$)/gm, '<li>$1</li>')
        .replace(/\n/g, '<br/>');

      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; line-height: 1.6; color: #111; }
              h1 { font-size: 24px; margin-bottom: 8px; color: #000; }
              strong { font-weight: 700; }
              li { margin-left: 20px; }
            </style>
          </head>
          <body>
            <h1>${autoTitle}</h1>
            <p style="color: #666; margin-bottom: 30px;">${new Date().toLocaleDateString()}</p>
            <div>${htmlContent}</div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share your note as PDF',
        });
      } else {
        Alert.alert('Sharing not available on this device');
      }
    } catch (error) {
      console.error('PDF export failed:', error);
      Alert.alert('Export failed', 'Could not generate PDF. Please try again.');
    }
  };

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
          
          <TouchableOpacity onPress={exportToPDF}>
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