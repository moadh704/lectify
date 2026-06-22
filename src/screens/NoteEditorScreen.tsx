import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { NoteEditorScreenProps } from '@/navigation/types';
import { spacing } from '@/constants/spacing';

export default function NoteEditorScreen({ navigation, route }: NoteEditorScreenProps) {
  const { colors } = useTheme();
  const [content, setContent] = React.useState('Start typing your lecture notes here...\n\n• Key concept 1\n• Key concept 2');

  const autoTitle = 'Monday June 22, 11:57pm';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.back, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => { }}>
            <Text style={[styles.share, { color: colors.primary }]}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={[styles.autoTitle, { color: colors.text }]}>{autoTitle}</Text>
          <Text style={[styles.tapToRename, { color: colors.textSecondary }]}>Tap to rename</Text>
        </View>

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

        <View style={[styles.toolbar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity style={styles.toolButton}>
            <Text style={[styles.toolText, { color: colors.primary }]}>B</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolButton}>
            <Text style={[styles.toolText, { color: colors.primary }]}>•</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolButton}>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1 },
  back: { fontSize: 16, fontWeight: '500' },
  share: { fontSize: 16, fontWeight: '500' },
  titleContainer: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  autoTitle: { fontSize: 18, fontWeight: '600' },
  tapToRename: { fontSize: 12, marginTop: 2 },
  editor: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md, fontSize: 16, lineHeight: 24 },
  toolbar: { flexDirection: 'row', paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderTopWidth: 1, justifyContent: 'flex-start', gap: spacing.xl },
  toolButton: { padding: spacing.sm },
  toolText: { fontSize: 18, fontWeight: '600' },
});