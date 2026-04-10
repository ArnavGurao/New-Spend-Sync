// ── FILE: components/cards/CreditCard.tsx ────────────────────────────────────

import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { getGradientColors } from '../../constants/gradients';
import { fmt } from '../../lib/formatters';
import type { Card, Subscription } from '../../store/useStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;

const SIZE_CONFIG = {
  hero:      { width: CARD_WIDTH, height: 192 },
  stacked:   { width: CARD_WIDTH, height: 224 },
  thumbnail: { width: 120,        height: 76  },
};

interface CreditCardProps {
  card: Card;
  subscriptions: Subscription[];
  onPress?: () => void;
  size?: 'hero' | 'stacked' | 'thumbnail';
  flippable?: boolean;
}

export function CreditCard({
  card,
  subscriptions,
  onPress,
  size = 'hero',
  flippable = true,
}: CreditCardProps): React.JSX.Element {
  const isFlipped = useSharedValue(0);
  const { width, height } = SIZE_CONFIG[size];
  const gradientColors = getGradientColors(card.bank) as [string, string, ...string[]];

  const totalSubs = subscriptions.filter((s) => s.cardId === card.id);
  const totalMonthly = totalSubs.reduce((sum, s) => {
    if (s.cycle === 'monthly') return sum + s.amount;
    if (s.cycle === 'quarterly') return sum + s.amount / 3;
    if (s.cycle === 'yearly') return sum + s.amount / 12;
    return sum + s.amount;
  }, 0);

  const handlePress = useCallback(() => {
    if (flippable) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      isFlipped.value = withSpring(isFlipped.value === 0 ? 1 : 0, {
        damping: 15,
        stiffness: 120,
      });
    }
    onPress?.();
  }, [flippable, isFlipped, onPress]);

  // Front face style
  const frontAnimStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(isFlipped.value, [0, 1], [0, 180], Extrapolation.CLAMP);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  // Back face style
  const backAnimStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(isFlipped.value, [0, 1], [180, 360], Extrapolation.CLAMP);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const networkLabel =
    card.network === 'Visa' ? 'VISA' :
    card.network === 'Mastercard' ? '⬤◉ MC' : 'RuPay';

  if (size === 'thumbnail') {
    return (
      <Pressable onPress={handlePress} style={[styles.container, { width, height }]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, { borderRadius: 8 }]}
        >
          <Text style={styles.thumbnailLast4}>••{card.last4}</Text>
          <Text style={styles.thumbnailBank}>{card.bank.split(' ')[0]}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Front */}
      <Animated.View style={[StyleSheet.absoluteFill, frontAnimStyle]}>
        <Pressable onPress={handlePress} style={{ flex: 1 }}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {/* Header row */}
            <View style={styles.row}>
              <View>
                <Text style={styles.bank}>{card.bank}</Text>
                <Text style={styles.variant}>{card.variant}</Text>
              </View>
              <View style={styles.networkBadge}>
                <Text style={styles.network}>{networkLabel}</Text>
              </View>
            </View>

            {/* Chip + number */}
            <View style={styles.chipRow}>
              <View style={styles.chip} />
            </View>
            <Text style={styles.cardNumber}>
              •••• •••• •••• {card.last4}
            </Text>

            {/* Footer */}
            <View style={[styles.row, { marginTop: 8 }]}>
              <View>
                <Text style={styles.subLabel}>EXPIRES</Text>
                <Text style={styles.subValue}>{card.expiry}</Text>
              </View>
              {size === 'hero' && (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.subLabel}>MONTHLY</Text>
                  <Text style={styles.subValue}>{fmt(card.monthlySpend)}</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      {/* Back */}
      {flippable && (
        <Animated.View style={[StyleSheet.absoluteFill, backAnimStyle]}>
          <Pressable onPress={handlePress} style={{ flex: 1 }}>
            <LinearGradient
              colors={gradientColors}
              start={{ x: 1, y: 1 }}
              end={{ x: 0, y: 0 }}
              style={[styles.gradient, styles.backFace]}
            >
              <Text style={styles.backTitle}>Subscriptions on this card</Text>
              <Text style={styles.backCount}>{totalSubs.length} active</Text>
              <Text style={styles.backAmount}>{fmt(Math.round(totalMonthly))}/mo</Text>
              <Text style={styles.backTip}>Tap to flip back</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bank: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  variant: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  networkBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  network: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  chipRow: {
    marginVertical: 8,
  },
  chip: {
    width: 36,
    height: 26,
    backgroundColor: 'rgba(255,215,0,0.6)',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  cardNumber: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  subLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  subValue: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  backFace: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  backTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  backCount: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 28,
    fontWeight: '700',
  },
  backAmount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  backTip: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    marginTop: 16,
    letterSpacing: 0.5,
  },
  thumbnailLast4: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  thumbnailBank: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    marginTop: 2,
    letterSpacing: 0.5,
  },
});
