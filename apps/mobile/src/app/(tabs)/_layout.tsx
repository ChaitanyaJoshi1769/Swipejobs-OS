import React from 'react';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tabs.Screen
        name="swipe"
        options={{
          title: 'Discover',
          headerTitle: 'Discover Jobs',
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: 'Applications',
          headerTitle: 'My Applications',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'My Profile',
        }}
      />
    </Tabs>
  );
}
