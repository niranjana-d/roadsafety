/**
 * Tab Layout — Bottom Navigation
 */
import React, { useContext } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../_layout';
import { useNotificationStore } from '../../src/store/notificationStore';

export default function TabLayout() {
  const { colors } = useContext(ThemeContext);
  const { unreadCount } = useNotificationStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.navBackground,
          borderTopColor: colors.navBorder,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <TabIcon name="chat" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calculator"
        options={{
          title: 'Calculator',
          tabBarIcon: ({ color }) => <TabIcon name="calculator" color={color} />,
        }}
      />
      <Tabs.Screen
        name="laws"
        options={{
          title: 'Laws',
          tabBarIcon: ({ color }) => <TabIcon name="laws" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon name="profile" color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ name, color }: { name: string; color: string }) {
  const icons: Record<string, string> = {
    home: '🏠',
    chat: '💬',
    calculator: '🧮',
    laws: '📚',
    profile: '👤',
  };

  return (
    <Text style={{ fontSize: 20 }} accessibilityLabel={name}>
      {icons[name] || '●'}
    </Text>
  );
}
