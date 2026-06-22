import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  NewSubject: undefined;
  Subject: { subjectId: string; subjectName: string };
  NoteEditor: { noteId?: string; subjectId: string };
  Settings: undefined;
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type NewSubjectScreenProps = NativeStackScreenProps<RootStackParamList, 'NewSubject'>;
export type SubjectScreenProps = NativeStackScreenProps<RootStackParamList, 'Subject'>;
export type NoteEditorScreenProps = NativeStackScreenProps<RootStackParamList, 'NoteEditor'>;
export type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;