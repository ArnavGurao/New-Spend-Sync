// ── FILE: app/(tabs)/_layout.tsx ──────────────────────────────────────────────
// Tab navigator with custom TabBar component.

import React from 'react';
import { Tabs } from 'expo-router';
import { TabBar } from '../../components/ui/TabBar';

export default function TabsLayout(): React.JSX.Element {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: 'shift',
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
