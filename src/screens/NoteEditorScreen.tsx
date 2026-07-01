import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { NoteEditorScreenProps } from '@/navigation/types';
import { spacing } from '@/constants/spacing';
import { saveNote, getNoteById, updateNote } from '@/utils/noteStorage';
import { getSettings, AppSettings } from '@/utils/settingsStorage';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function NoteEditorScreen({ navigation, route }: NoteEditorScreenProps) {
  const { colors } = useTheme();
  const { subjectId, noteId: initialNoteId } = route.params;

  const [content, setContent] = useState('');
  const [currentNoteId, setCurrentNoteId] = useState<string | undefined>(initialNoteId);
  const [isSaving, setIsSaving] = useState(false);

  // Title editing
  const [noteTitle, setNoteTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Editor settings from Settings screen
  const [editorSettings, setEditorSettings] = useState<AppSettings>({
    themeMode: 'system',
    fontSize: 'medium',
    fontStyle: 'system',
    sortOrder: 'newest',
  });

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

  // Rich Editor ref
  const richText = useRef<RichEditor>(null);

  // Load existing note if editing + editor settings
  useEffect(() => {
    const loadNoteAndSettings = async () => {
      if (initialNoteId) {
        const existingNote = await getNoteById(initialNoteId);
        if (existingNote) {
          setContent(existingNote.content || '');
          setNoteTitle(existingNote.title || '');
          setCurrentNoteId(existingNote.id);
        }
      } else {
        setContent('');
        setNoteTitle('');
      }

      // Load user font preferences
      const savedSettings = await getSettings();
      setEditorSettings(savedSettings);
    };
    loadNoteAndSettings();
  }, [initialNoteId]);

  // Auto-save every 3 seconds
  const autoSaveInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoSaveInterval.current) {
      clearInterval(autoSaveInterval.current);
    }

    autoSaveInterval.current = setInterval(async () => {
      if (content && content.trim() !== '<br>' && content.trim() !== '' && !isSaving) {
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
    if (!content || content.trim() === '<br>' || content.trim() === '') return;

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
    if (!content || content.trim() === '<br>' || content.trim() === '') {
      Alert.alert('Nothing to export', 'Please write some content first.');
      return;
    }

    try {
      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; line-height: 1.6; color: #111; }
            </style>
          </head>
          <body>
            <h1>${autoTitle}</h1>
            <p style="color: #666; margin-bottom: 30px;">${new Date().toLocaleDateString()}</p>
            <div>${content}</div>
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
          {isEditingTitle ? (
            <TextInput
              style={[styles.autoTitle, { color: colors.text, borderBottomWidth: 1, borderColor: colors.primary }]}
              value={noteTitle}
              onChangeText={setNoteTitle}
              onBlur={async () => {
                setIsEditingTitle(false);
                if (currentNoteId && noteTitle.trim()) {
                  await updateNote(currentNoteId, { title: noteTitle.trim() });
                }
              }}
              onSubmitEditing={() => setIsEditingTitle(false)}
              autoFocus
            />
          ) : (
            <TouchableOpacity onPress={() => setIsEditingTitle(true)}>
              <Text style={[styles.autoTitle, { color: colors.text }]}>
                {noteTitle || autoTitle}
              </Text>
              <Text style={[styles.tapToRename, { color: colors.textSecondary }]}>Tap to rename</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Rich Text Editor - Day One Inspired (Clean & Minimal) */}
        <RichEditor
          ref={richText}
          style={[styles.editor, { 
            backgroundColor: colors.background,
            paddingHorizontal: spacing.lg,
          }]}
          initialContentHTML={content}
          placeholder="Start writing..."
          editorStyle={{
            backgroundColor: colors.background,
            color: colors.text,
            placeholderColor: colors.textSecondary,
            fontSize: 18,
            lineHeight: 28,
            paddingTop: 8,
          }}
          onChange={(html) => {
            setContent(html);
          }}
        />

        {/* Very Minimal Toolbar (Day One style) */}
        <RichToolbar
          editor={richText}
          style={[styles.toolbar, { 
            backgroundColor: colors.surface, 
            borderTopColor: colors.border,
            height: 50,
          }]}
          iconTint={colors.textSecondary}
          selectedIconTint={colors.primary}
          iconSize={20}
          actions={[
            actions.setBold,
            actions.insertBulletsList,
            actions.heading1,
          ]}
        />
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
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: spacing.md,
  },
  toolbar: {
    borderTopWidth: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.lg,
    height: 52,
  },
});