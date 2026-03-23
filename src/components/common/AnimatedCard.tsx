/**
 * ============================================================
 * AnimatedCard - Carte avec animation d'entrée
 * Apparition avec fade-in + slide-up au chargement
 * ============================================================
 */
import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../theme/theme';

interface AnimatedCardProps {
  children: React.ReactNode;
  index?: number;         // Index pour animation séquentielle
  delay?: number;         // Délai custom en ms
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
}

export default function AnimatedCard({
  children,
  index = 0,
  delay,
  style,
  variant = 'default',
}: AnimatedCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  // Déclencher l'animation d'entrée au montage
  useEffect(() => {
    const animDelay = delay ?? index * 100;
    opacity.value = withDelay(animDelay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(
      animDelay,
      withSpring(0, { damping: 18, stiffness: 120 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const variantStyles: Record<string, ViewStyle> = {
    default: {
      backgroundColor: COLORS.white,
      ...SHADOWS.light,
    },
    elevated: {
      backgroundColor: COLORS.white,
      ...SHADOWS.medium,
    },
    outlined: {
      backgroundColor: COLORS.white,
      borderWidth: 1,
      borderColor: COLORS.gray200,
    },
  };

  return (
    <Animated.View
      style={[
        styles.card,
        variantStyles[variant],
        animatedStyle,
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
});
