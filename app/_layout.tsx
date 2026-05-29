/**
 * Root Layout — App-wide providers and theme configuration
 */
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, useColorScheme } from 'react-native';
import { useSettingsStore } from '../src/store/settingsStore';
import { lightColors, darkColors, type ThemeColors } from '../src/constants/theme';

export const ThemeContext = React.createContext<{
  colors: ThemeColors;
  isDark: boolean;
}>({
  colors: lightColors,
  isDark: false,
});

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const { settings } = useSettingsStore();

  const isDark =
    settings.theme === 'dark' ||
    (settings.theme === 'system' && systemScheme === 'dark');

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDark }}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="emergency"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="law-detail/[id]" />
          <Stack.Screen name="compare-laws" />
          <Stack.Screen name="search" />
        </Stack>
      </View>
    </ThemeContext.Provider>
  );
}
