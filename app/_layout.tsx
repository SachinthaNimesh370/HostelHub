import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider as AppThemeProvider, useAppTheme } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';

export const unstable_settings = {
  anchor: '(auth)',
};

function RootNavigation() {
  const { colorScheme } = useAppTheme();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <AuthProvider>
          <RootNavigation />
        </AuthProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}
