import React, { useEffect, useState } from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';
import { getInitials } from '../../constants/logoMap';

interface BrandLogoProps {
  label: string;
  uri?: string | null;
  size?: number;
  rounded?: number;
  fallbackText?: string;
}

export function BrandLogo({
  label,
  uri,
  size = 42,
  rounded,
  fallbackText,
}: BrandLogoProps): React.JSX.Element {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  const borderRadius = rounded ?? Math.max(10, Math.round(size * 0.28));
  const monogram = fallbackText ?? getInitials(label);

  return (
    <View
      style={[
        styles.frame,
        {
          width: size,
          height: size,
          borderRadius,
        },
      ]}
    >
      {!failed && uri ? (
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <Text style={styles.fallback}>{monogram}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: 'rgba(72,72,72,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '76%',
    height: '76%',
  },
  fallback: {
    color: COLORS.onPrimary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
