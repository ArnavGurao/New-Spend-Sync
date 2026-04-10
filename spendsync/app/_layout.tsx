// Root layout: loads fonts, initializes DB, seeds data, and renders the fixed app shell.

import React, { useEffect } from 'react';
import { View, Text, Pressable, StatusBar, StyleSheet } from 'react-native';
import { Stack, usePathname, useRouter, type Href } from 'expo-router';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, Manrope_700Bold, Manrope_400Regular } from '@expo-google-fonts/manrope';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { initDB, seedIfEmpty, fetchAllCards, fetchAllSubscriptions } from '../db/client';
import { useStore } from '../store/useStore';
import { Toast } from '../components/ui/Toast';
import { COLORS } from '../constants/theme';

type ShellNavItem = {
  href: Href;
  label: string;
  matches: (pathname: string) => boolean;
};

const TOP_BAR_HEIGHT = 72;
const SIDE_BAR_WIDTH = 220;

const SIDE_NAV_ITEMS: ShellNavItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    matches: (pathname) => pathname === '/' || pathname.startsWith('/subscriptions/'),
  },
  {
    href: '/advisor',
    label: 'Card Optimizer',
    matches: (pathname) => pathname.startsWith('/advisor'),
  },
  {
    href: '/add-card',
    label: 'Add Cards',
    matches: (pathname) => pathname.startsWith('/add-card'),
  },
  {
    href: '/analytics',
    label: 'Analytics',
    matches: (pathname) => pathname.startsWith('/analytics'),
  },
  {
    href: '/about',
    label: 'About',
    matches: (pathname) => pathname.startsWith('/about'),
  },
];

const TOP_NAV_ITEMS: ShellNavItem[] = [
  {
    href: '/alerts',
    label: 'Notifications',
    matches: (pathname) => pathname.startsWith('/alerts'),
  },
  {
    href: '/profile',
    label: 'Profile',
    matches: (pathname) => pathname.startsWith('/profile'),
  },
  {
    href: '/settings',
    label: 'Settings',
    matches: (pathname) => pathname.startsWith('/settings'),
  },
];

SplashScreen.preventAutoHideAsync();

export default function RootLayout(): React.JSX.Element | null {
  const [fontsLoaded, fontError] = useFonts({
    Manrope_700Bold,
    Manrope_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const { setCards, setSubscriptions, setLoading } = useStore();

  useEffect(() => {
    if (!fontsLoaded && !fontError) return;

    async function bootstrap() {
      try {
        await initDB();
        await seedIfEmpty();
        const [cards, subscriptions] = await Promise.all([
          fetchAllCards(),
          fetchAllSubscriptions(),
        ]);
        setCards(cards);
        setSubscriptions(subscriptions);
      } catch (err) {
        console.error('Bootstrap error:', err);
      } finally {
        setLoading(false);
        SplashScreen.hideAsync();
      }
    }

    bootstrap();
  }, [fontsLoaded, fontError, setCards, setSubscriptions, setLoading]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.surface} />
      <ShellNavigator />
      <Toast />
    </SafeAreaProvider>
  );
}

function ShellNavigator(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const urgentCount = useStore((state) => state.urgentCount());

  const shellTopOffset = TOP_BAR_HEIGHT + insets.top;

  const navigate = (href: Href) => {
    if (pathname === href) return;
    router.push(href);
  };

  return (
    <View style={styles.shellRoot}>
      <View style={[styles.topBar, { paddingTop: insets.top, height: shellTopOffset }]}>
        <Text style={styles.brandTitle}>SpendSync</Text>

        <View style={styles.topActions}>
          {TOP_NAV_ITEMS.map((item) => {
            const active = item.matches(pathname);
            const showBadge = item.href === '/alerts' && urgentCount > 0;

            return (
              <Pressable
                key={String(item.href)}
                onPress={() => navigate(item.href)}
                style={[styles.topActionButton, active && styles.topActionButtonActive]}
              >
                <Text style={[styles.topActionText, active && styles.topActionTextActive]}>
                  {item.label}
                </Text>
                {showBadge && (
                  <View style={styles.topActionBadge}>
                    <Text style={styles.topActionBadgeText}>
                      {urgentCount > 9 ? '9+' : urgentCount}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.sideBar, { top: shellTopOffset, width: SIDE_BAR_WIDTH }]}>
        <View style={styles.sideNav}>
          {SIDE_NAV_ITEMS.map((item) => {
            const active = item.matches(pathname);
            return (
              <Pressable
                key={String(item.href)}
                onPress={() => navigate(item.href)}
                style={[styles.sideNavButton, active && styles.sideNavButtonActive]}
              >
                <Text style={[styles.sideNavText, active && styles.sideNavTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View
        style={[
          styles.contentArea,
          {
            marginTop: shellTopOffset,
            marginLeft: SIDE_BAR_WIDTH,
          },
        ]}
      >
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.surfaceContainerLowest },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="subscriptions/[cardId]" options={{ presentation: 'card' }} />
          <Stack.Screen name="add-card" options={{ presentation: 'card' }} />
          <Stack.Screen name="advisor" options={{ presentation: 'card' }} />
          <Stack.Screen name="dna" options={{ presentation: 'card' }} />
          <Stack.Screen name="about" options={{ presentation: 'card' }} />
          <Stack.Screen name="profile" options={{ presentation: 'card' }} />
          <Stack.Screen name="settings" options={{ presentation: 'card' }} />
        </Stack>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shellRoot: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: COLORS.surfaceContainerLow,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandTitle: {
    color: COLORS.onSurface,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topActionButton: {
    minHeight: 38,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainer,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topActionButtonActive: {
    backgroundColor: COLORS.surfaceContainerHighest,
    borderColor: COLORS.primaryContainer,
  },
  topActionText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    fontWeight: '600',
  },
  topActionTextActive: {
    color: COLORS.onSurface,
  },
  topActionBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
  },
  topActionBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  sideBar: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    zIndex: 10,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRightWidth: 1,
    borderRightColor: COLORS.outlineVariant,
  },
  sideNav: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 10,
  },
  sideNavButton: {
    minHeight: 46,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sideNavButtonActive: {
    backgroundColor: COLORS.surfaceContainerHighest,
    borderColor: COLORS.primaryContainer,
  },
  sideNavText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '600',
  },
  sideNavTextActive: {
    color: COLORS.onSurface,
  },
  contentArea: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceContainerLowest,
  },
});
