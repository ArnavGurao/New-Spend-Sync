// ── FILE: app/_layout.tsx ─────────────────────────────────────────────────────
// Root layout: loads fonts, initializes DB, seeds data, safe area provider.

import React, { useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Manrope_700Bold, Manrope_400Regular } from '@expo-google-fonts/manrope';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { initDB, seedIfEmpty, fetchAllCards, fetchAllSubscriptions } from '../db/client';
import { useStore } from '../store/useStore';
import { Toast } from '../components/ui/Toast';

// Prevent auto-hide until fonts load
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
      <StatusBar barStyle="light-content" backgroundColor="#0e0e0e" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0e0e0e' } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="subscriptions/[cardId]" options={{ presentation: 'card' }} />
        <Stack.Screen name="add-card" options={{ presentation: 'modal' }} />
        <Stack.Screen name="advisor" options={{ presentation: 'card' }} />
        <Stack.Screen name="dna" options={{ presentation: 'card' }} />
      </Stack>
      <Toast />
    </SafeAreaProvider>
  );
}
