import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { NewSubjectScreenProps } from '@/navigation/types';
import { spacing } from '@/constants/spacing';

export default function NewSubjectScreen({ navigation }: NewSubjectScreenProps) {
  const { colors } = useTheme();
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');

  const handleCreate = () => {
    if (name.trim()) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>New Subject</Text>
          
          <Text style={[styles.label, { color: colors.text }]}>Subject name</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.surface, 
              color: colors.text,
              borderColor: colors.border 
            }]}
            placeholder="e.g. Linear Algebra"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <Text style={[styles.label, { color: colors.text, marginTop: spacing.lg }]}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.multilineInput, { 
              backgroundColor: colors.surface, 
              color: colors.text,
              borderColor: colors.border 
            }]}
            placeholder="Professor, schedule, room..."
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        <TouchableOpacity 
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={handleCreate}
          disabled={!name.trim()}
        >
          <Text style={styles.createButtonText}>Create Subject</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1, justifyContent: 'space-between' },
  content: { flex: 1, padding: spacing.lg },
  title: { fontSize: 24, fontWeight: '700', marginBottom: spacing.xl },
  label: { fontSize: 14, fontWeight: '500', marginBottom: spacing.sm },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: 16 },
  multilineInput: { minHeight: 100, textAlignVertical: 'top' },
  createButton: { margin: spacing.lg, paddingVertical: spacing.md, borderRadius: 12, alignItems: 'center' },
  createButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
});