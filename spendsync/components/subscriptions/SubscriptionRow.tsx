// ── FILE: components/subscriptions/SubscriptionRow.tsx ───────────────────────
// Swipeable subscription row — swipe-left reveals red Cancel action.

import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  PanResponder,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { StatusBadge } from './StatusBadge';
import { fmt, fmtCycle } from '../../lib/formatters';
import type { Subscription } from '../../store/useStore';
import { COLORS } from '../../constants/theme';

const SWIPE_THRESHOLD = 80;
const ACTION_WIDTH = 80;

interface SubscriptionRowProps {
  subscription: Subscription;
  onCancel?: (id: string) => void;
  showCard?: boolean;
  cardVariant?: string;
}

export function SubscriptionRow({
  subscription,
  onCancel,
  showCard = false,
  cardVariant,
}: SubscriptionRowProps): React.JSX.Element {
  const translateX = useRef(new Animated.Value(0)).current;
  const swipedOpen = useRef(false);

  const close = useCallback(() => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      damping: 20,
      stiffness: 300,
    }).start();
    swipedOpen.current = false;
  }, [translateX]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        const newX = swipedOpen.current ? g.dx - ACTION_WIDTH : g.dx;
        if (newX < 0) {
          translateX.setValue(Math.max(newX, -ACTION_WIDTH));
        }
      },
      onPanResponderRelease: (_, g) => {
        const currentX = swipedOpen.current ? g.dx - ACTION_WIDTH : g.dx;
        if (currentX < -SWIPE_THRESHOLD) {
          Animated.spring(translateX, {
            toValue: -ACTION_WIDTH,
            useNativeDriver: true,
            damping: 20,
            stiffness: 300,
          }).start();
          swipedOpen.current = true;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          close();
        }
      },
    })
  ).current;

  const handleCancel = () => {
    Alert.alert(
      `Cancel ${subscription.name}?`,
      'This will remove the subscription from SpendSync.',
      [
        { text: 'Keep', style: 'cancel', onPress: close },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            close();
            onCancel?.(subscription.id);
          },
        },
      ]
    );
  };

  const statusBorderColor =
    subscription.status === 'urgent'       ? COLORS.error :
    subscription.status === 'warning'      ? COLORS.secondary :
    subscription.status === 'trial-urgent' ? COLORS.primary :
    COLORS.outlineVariant;

  return (
    <View style={styles.outerContainer}>
      {/* Cancel action revealed on swipe */}
      <View style={styles.cancelAction}>
        <Pressable onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelIcon}>✕</Text>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>

      {/* Row content */}
      <Animated.View
        style={[styles.row, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {/* Status accent */}
        <View style={[styles.statusBar, { backgroundColor: statusBorderColor }]} />

        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>{getIconEmoji(subscription.icon)}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.name} numberOfLines={1}>{subscription.name}</Text>
            <Text style={styles.amount}>{fmt(subscription.amount)}</Text>
          </View>
          <View style={styles.bottomRow}>
            <Text style={styles.meta}>
              {fmtCycle(subscription.cycle)}
              {showCard && cardVariant ? ` · ${cardVariant}` : ''}
              {` · ${subscription.category}`}
            </Text>
            <StatusBadge status={subscription.status} renewalDays={subscription.renewalDays} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

function getIconEmoji(icon: string): string {
  const map: Record<string, string> = {
    movie: '🎬', music_note: '🎵', local_shipping: '📦', play_circle: '▶️',
    stars: '⭐', restaurant: '🍽️', palette: '🎨', brush: '🖌️',
    cloud: '☁️', video_camera_front: '📹', fastfood: '🍔', work: '💼',
    'auto_awesome': '✨', 'notifications_active': '🔔',
  };
  return map[icon] ?? '●';
}

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 14,
    overflow: 'hidden',
  },
  cancelAction: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: ACTION_WIDTH,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    alignItems: 'center',
    gap: 2,
  },
  cancelIcon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2020',
    borderRadius: 14,
    overflow: 'hidden',
  },
  statusBar: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 0,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#252626',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    marginVertical: 12,
  },
  iconText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    color: '#e7e5e4',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  amount: {
    color: '#ffbf00',
    fontSize: 15,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: {
    color: '#acabaa',
    fontSize: 12,
    flex: 1,
  },
});
