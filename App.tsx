import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ToastContainer } from './src/components/Toast';
import { useThemeStore } from './src/store/useThemeStore';

export default function App() {
  const { colorScheme } = useThemeStore();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />
      <ToastContainer />
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </GestureHandlerRootView>
  );
}
