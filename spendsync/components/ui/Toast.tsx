// ── FILE: components/ui/Toast.tsx ─────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
import { COLORS } from '../../constants/theme';

export function Toast(): React.JSX.Element | null {
  const { toastMessage, toastType, hideToast } = useStore();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (toastMessage) {
      // Animate in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 300,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 3s
      timerRef.current = setTimeout(() => {
        dismissToast();
      }, 3000);
    } else {
      translateY.setValue(-100);
      opacity.setValue(0);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toastMessage]);

  const dismissToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      hideToast();
    });
  };

  if (!toastMessage) return null;

  const borderColor =
    toastType === 'success' ? COLORS.brandTeal :
    toastType === 'error'   ? COLORS.error :
    COLORS.secondary;

  const icon =
    toastType === 'success' ? '✓' :
    toastType === 'error'   ? '✗' : 'ℹ';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + 12,
          transform: [{ translateY }],
          opacity,
          borderLeftColor: borderColor,
        },
      ]}
    >
      <Pressable onPress={dismissToast} style={styles.inner}>
        <Text style={[styles.icon, { color: borderColor }]}>{icon}</Text>
        <Text style={styles.message}>{toastMessage}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    backgroundColor: '#1f2020',
    borderRadius: 12,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  icon: {
    fontSize: 16,
    fontWeight: '700',
  },
  message: {
    color: '#e7e5e4',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});
