import { Tabs } from 'expo-router';
import React from 'react';
import { BlurView } from 'expo-blur';
import { Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#71717a',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: 'rgba(9, 9, 11, 0.8)',
            borderTopWidth: 0,
            elevation: 0,
          },
          default: {
            backgroundColor: '#09090b',
            borderTopColor: '#27272a',
            elevation: 0,
          },
        }),
        tabBarBackground: () => 
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} tint="dark" style={{ flex: 1 }} />
          ) : (
            <View style={{ flex: 1, backgroundColor: '#09090b' }} />
          ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Etkinlikler',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="compass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Keşfet',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="search" color={color} />,
        }}
      />
      <Tabs.Screen
        name="joined-events"
        options={{
          title: 'Etkinliklerim',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profilim',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}
