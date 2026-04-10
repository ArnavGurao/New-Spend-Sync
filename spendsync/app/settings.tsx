import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

const SETTINGS_GROUPS = [
  {
    title: 'Preferences',
    items: ['Notification reminders', 'Subscription renewal alerts', 'Monthly summary digest'],
  },
  {
    title: 'Security',
    items: ['Profile access', 'Saved card privacy', 'App session controls'],
  },
  {
    title: 'Support',
    items: ['Help center', 'Contact support', 'Version information'],
  },
];

export default function SettingsScreen(): React.JSX.Element {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Settings</Text>

      {SETTINGS_GROUPS.map((group) => (
        <View key={group.title} style={styles.groupCard}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          {group.items.map((item) => (
            <View key={item} style={styles.settingRow}>
              <Text style={styles.settingText}>{item}</Text>
              <Text style={styles.settingMeta}>Manage</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    padding: 24,
    gap: 20,
  },
  title: {
    color: COLORS.onSurface,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  groupCard: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 18,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  groupTitle: {
    color: COLORS.onSurface,
    fontSize: 16,
    fontWeight: '700',
  },
  settingRow: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '500',
  },
  settingMeta: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
