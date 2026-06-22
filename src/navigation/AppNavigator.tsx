import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/theme';

import HomeScreen from '@/screens/HomeScreen';
import NewSubjectScreen from '@/screens/NewSubjectScreen';
import SubjectScreen from '@/screens/SubjectScreen';
import NoteEditorScreen from '@/screens/NoteEditorScreen';
import SettingsScreen from '@/screens/SettingsScreen';

import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { colors, isDark } = useTheme();

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: colors.primary,
        },
      }}
    >
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Lectify' }}
        />
        <Stack.Screen 
          name="NewSubject" 
          component={NewSubjectScreen} 
          options={{ title: 'New Subject' }}
        />
        <Stack.Screen 
          name="Subject" 
          component={SubjectScreen} 
          options={({ route }) => ({ 
            title: route.params?.subjectName || 'Subject' 
          })}
        />
        <Stack.Screen 
          name="NoteEditor" 
          component={NoteEditorScreen} 
          options={{ title: 'Note' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}