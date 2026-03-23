/**
 * ============================================================
 * LoadingScreen - Écran de chargement avec animation
 * Spinner et texte pulsant avec dégradé de fond
 * ============================================================
 */
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT_SIZE, FONT_WEIGHT } from '../../theme/theme';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Chargement...' }: LoadingScreenProps) {
  // Animation de pulsation du texte
  const textOpacity = useSharedValue(0.5);

  useEffect(() => {
    textOpacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1, // Infiniment
      true // Reverse
    );
  }, []);

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  // Animation de rotation du spinner
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1200, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedSpinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <LinearGradient
      colors={COLORS.primaryGradient as unknown as [string, string, ...string[]]}
      style={styles.container}
    >
      {/* Spinner circulaire custom */}
      <Animated.View style={[styles.spinner, animatedSpinnerStyle]}>
        <View style={styles.spinnerInner} />
      </Animated.View>

      {/* Message pulsant */}
      <Animated.Text style={[styles.message, animatedTextStyle]}>
        {message}
      </Animated.Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: COLORS.whiteAlpha(0.3),
    borderTopColor: COLORS.white,
    marginBottom: 24,
  },
  spinnerInner: {
    flex: 1,
  },
  message: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.medium,
  },
});
