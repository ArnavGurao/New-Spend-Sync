// ── FILE: components/ui/CountUp.tsx ──────────────────────────────────────────

import React, { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedProps,
  Easing,
  createAnimatedComponent,
} from 'react-native-reanimated';

const AnimatedText = createAnimatedComponent(Text);

interface CountUpProps {
  target: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
  style?: object;
}

export function CountUp({
  target,
  prefix = '',
  suffix = '',
  className,
  duration = 1500,
  style,
}: CountUpProps): React.JSX.Element {
  const sv = useSharedValue(0);

  useEffect(() => {
    sv.value = 0;
    sv.value = withTiming(target, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [target, duration, sv]);

  const animatedProps = useAnimatedProps(() => {
    const rounded = Math.round(sv.value);
    const formatted = rounded.toLocaleString('en-IN');
    return {
      text: `${prefix}${formatted}${suffix}`,
      defaultValue: `${prefix}${formatted}${suffix}`,
    };
  });

  return (
    <AnimatedText
      className={className}
      style={style}
      // @ts-expect-error — Reanimated animated text prop
      animatedProps={animatedProps}
    >
      {`${prefix}0${suffix}`}
    </AnimatedText>
  );
}
