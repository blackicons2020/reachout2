import React from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, Send, Users, Sparkles } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { AIChatFAB } from '@/components/AIChatFAB';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
          tabBarStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            borderTopWidth: 1,
            borderTopColor: colorScheme === 'dark' ? '#1e293b' : '#e2e8f0',
            paddingTop: 8,
            height: 60,
          },
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="campaigns"
          options={{
            title: 'Campaigns',
            tabBarIcon: ({ color }) => <Send size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="contacts"
          options={{
            title: 'Contacts',
            tabBarIcon: ({ color }) => <Users size={24} color={color} />,
          }}
        />
      </Tabs>
      <AIChatFAB />
    </>
  );
}
