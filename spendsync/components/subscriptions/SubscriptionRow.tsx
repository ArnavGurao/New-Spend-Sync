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
import { BrandLogo } from '../ui/BrandLogo';
import { getSubscriptionLogoUri } from '../../constants/logoMap';

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
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderMove: (_, gesture) => {
        const nextX = swipedOpen.current ? gesture.dx - ACTION_WIDTH : gesture.dx;
        if (nextX < 0) {
          translateX.setValue(Math.max(nextX, -ACTION_WIDTH));
        }
      },
      onPanResponderRelease: (_, gesture) => {
        const currentX = swipedOpen.current ? gesture.dx - ACTION_WIDTH : gesture.dx;
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
    subscription.status === 'urgent' ? COLORS.error :
    subscription.status === 'warning' ? COLORS.secondary :
    subscription.status === 'trial-urgent' ? COLORS.primary :
    COLORS.outlineVariant;

  const brandLogoUri = getSubscriptionLogoUri(subscription.name);

  return (
    <View style={styles.outerContainer}>
      <View style={styles.cancelAction}>
        <Pressable onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelIcon}>x</Text>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>

      <Animated.View
        style={[styles.row, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <View style={[styles.statusBar, { backgroundColor: statusBorderColor }]} />

        <View style={styles.logoWrap}>
          <BrandLogo
            label={subscription.name}
            uri={brandLogoUri}
            size={44}
            fallbackText={getIconEmoji(subscription.icon)}
          />
        </View>

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.name} numberOfLines={1}>{subscription.name}</Text>
            <Text style={styles.amount}>{fmt(subscription.amount)}</Text>
          </View>
          <View style={styles.bottomRow}>
            <Text style={styles.meta} numberOfLines={1}>
              {fmtCycle(subscription.cycle)}
              {showCard && cardVariant ? ` - ${cardVariant}` : ''}
              {` - ${subscription.category}`}
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
    movie: 'TV',
    music_note: 'MU',
    local_shipping: 'AM',
    play_circle: 'YT',
    stars: 'DS',
    restaurant: 'FD',
    palette: 'CN',
    brush: 'AD',
    cloud: 'CL',
    video_camera_front: 'ZM',
    fastfood: 'SW',
    work: 'IN',
    auto_awesome: 'SP',
    notifications_active: 'NT',
  };
  return map[icon] ?? 'SS';
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
    textTransform: 'uppercase',
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
  },
  logoWrap: {
    marginLeft: 12,
    marginVertical: 12,
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
    gap: 10,
  },
  meta: {
    color: '#acabaa',
    fontSize: 12,
    flex: 1,
  },
});
