// Tab navigator with the bottom tab bar hidden because the app now uses the fixed shell navigation.

import React from 'react';
import { Tabs } from 'expo-router';

export default function TabsLayout(): React.JSX.Element {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'shift',
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Dashboard', tabBarLabel: 'Dashboard' }}
      />
      <Tabs.Screen
        name="analytics"
        options={{ title: 'Analytics', tabBarLabel: 'Analytics' }}
      />
      <Tabs.Screen
        name="alerts"
        options={{ title: 'Alerts', tabBarLabel: 'Alerts' }}
      />
    </Tabs>
  );
}
