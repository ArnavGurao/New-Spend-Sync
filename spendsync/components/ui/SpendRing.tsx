// ── FILE: components/ui/SpendRing.tsx ────────────────────────────────────────

import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  useAnimatedProps,
} from 'react-native-reanimated';
import { fmt } from '../../lib/formatters';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface SpendSegment {
  value: number;
  color: string;
  label: string;
}

interface SpendRingProps {
  segments: SpendSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel: string;
  centerValue: number;
}

export function SpendRing({
  segments,
  size = 240,
  strokeWidth = 24,
  centerLabel,
  centerValue,
}: SpendRingProps): React.JSX.Element {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  // One shared value per segment for dashoffset animation
  const offsets = segments.map(() => useSharedValue(circumference));

  useEffect(() => {
    let cumulative = 0;
    segments.forEach((seg, i) => {
      const fraction = seg.value / total;
      const dash = circumference * (1 - fraction);
      // Stagger 150ms per segment
      offsets[i].value = withTiming(cumulative > 0 ? circumference - cumulative * circumference + dash : dash, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      });
      cumulative += fraction;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments]);

  // Build animated props for each segment
  const segmentRotations: number[] = [];
  {
    let accum = 0;
    segments.forEach((seg) => {
      segmentRotations.push(accum * 360 - 90);
      accum += seg.value / total;
    });
  }

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        {/* Background track */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="#252626"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {segments.map((seg, i) => {
          const fraction = seg.value / total;
          const segLength = circumference * fraction;
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const animProps = useAnimatedProps(() => ({
            strokeDashoffset: circumference - segLength * (1 - offsets[i].value / circumference),
          }));
          return (
            <G key={seg.label} rotation={segmentRotations[i]} origin={`${cx},${cy}`}>
              <AnimatedCircle
                cx={cx}
                cy={cy}
                r={radius}
                stroke={seg.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${segLength} ${circumference - segLength}`}
                animatedProps={animProps}
                strokeLinecap="butt"
              />
            </G>
          );
        })}
      </Svg>
      {/* Center text */}
      <View
        style={{
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            color: '#e7e5e4',
            fontSize: 22,
            fontWeight: '700',
            letterSpacing: -0.5,
          }}
        >
          {fmt(Math.round(centerValue))}
        </Text>
        <Text
          style={{
            color: '#acabaa',
            fontSize: 11,
            marginTop: 2,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          {centerLabel}
        </Text>
      </View>
    </View>
  );
}
