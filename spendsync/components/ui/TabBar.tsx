// ── FILE: components/ui/TabBar.tsx ────────────────────────────────────────────

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useStore } from '../../store/useStore';
import { COLORS } from '../../constants/theme';

const TABS = [
  { name: 'index',     route: '/',          label: 'Dashboard', icon: '⬛',  iconActive: '🏠' },
  { name: 'analytics', route: '/analytics', label: 'Analytics', icon: '📊',  iconActive: '📊' },
  { name: 'alerts',    route: '/alerts',    label: 'Alerts',    icon: '🔔',  iconActive: '🔔' },
] as const;

// Material Symbols icon names used as text fallback
const ICON_MAP: Record<string, { inactive: string; active: string }> = {
  index:     { inactive: 'D', active: 'D' },
  analytics: { inactive: 'A', active: 'A' },
  alerts:    { inactive: 'N', active: 'N' },
};

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const urgentCount = useStore((s) => s.urgentCount());

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];
          const label = (options.tabBarLabel as string) ?? options.title ?? route.name;

          const iconLabels: Record<string, string> = {
            index: '⊞',
            analytics: '◈',
            alerts: '◎',
          };
          const icon = iconLabels[route.name] ?? '●';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const showBadge = route.name === 'alerts' && urgentCount > 0;

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tab}>
              <View style={[styles.pill, isFocused && styles.pillActive]}>
                <View style={styles.iconWrapper}>
                  <Text style={[styles.icon, isFocused && styles.iconActive]}>
                    {icon}
                  </Text>
                  {showBadge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{urgentCount > 9 ? '9+' : urgentCount}</Text>
                    </View>
                  )}
                </View>
                {isFocused && (
                  <Text style={styles.label}>{label}</Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(25,26,26,0.92)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(72,72,72,0.15)',
    paddingTop: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 62,
    paddingHorizontal: 14,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 22,
    gap: 7,
  },
  pillActive: {
    backgroundColor: COLORS.surfaceContainerHighest,
  },
  iconWrapper: {
    position: 'relative',
  },
  icon: {
    fontSize: 20,
    color: COLORS.primaryContainer,
  },
  iconActive: {
    color: COLORS.primary,
  },
  label: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
});
