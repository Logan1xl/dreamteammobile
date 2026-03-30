/**
 * ============================================================
 * Splash Screen Animé - Dream Team Mobile
 * Palette harmonisée : Bleu Océan + Or Cuivré
 * ============================================================
 */
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, StatusBar } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../src/store/useAuthStore';
import { COLORS, FONT_WEIGHT, SPACING, RADIUS, SHADOWS } from '../src/theme/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setLoading = useAuthStore((s) => s.setLoading);

  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);
  const dotsOpacity = useSharedValue(0);
  const ring1Scale = useSharedValue(0.8);
  const ring1Opacity = useSharedValue(0);
  const ring2Scale = useSharedValue(0.8);
  const ring2Opacity = useSharedValue(0);
  const screenOpacity = useSharedValue(1);

  const navigateAway = () => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/login');
    }
  };

  useEffect(() => {
    ring1Opacity.value = withDelay(200, withTiming(0.2, { duration: 600 }));
    ring1Scale.value = withDelay(200, withRepeat(withTiming(1.6, { duration: 2500 }), -1, true));
    
    ring2Opacity.value = withDelay(500, withTiming(0.1, { duration: 600 }));
    ring2Scale.value = withDelay(500, withRepeat(withTiming(1.9, { duration: 3000 }), -1, true));

    logoOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    logoScale.value = withDelay(300, withSequence(
      withSpring(1.1, { damping: 8 }),
      withSpring(1, { damping: 12 })
    ));

    titleOpacity.value = withDelay(800, withTiming(1, { duration: 700 }));
    titleTranslateY.value = withDelay(800, withSpring(0, { damping: 15 }));

    subtitleOpacity.value = withDelay(1300, withTiming(1, { duration: 600 }));

    dotsOpacity.value = withDelay(1600, withRepeat(
      withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    ));

    screenOpacity.value = withDelay(3200, withTiming(0, { duration: 600 }, (finished) => {
      if (finished) {
        runOnJS(navigateAway)();
        runOnJS(setLoading)(false);
      }
    }));
  }, []);

  const logoAnimStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const titleAnimStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleAnimStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const dotsAnimStyle = useAnimatedStyle(() => ({
    opacity: dotsOpacity.value,
  }));

  const ring1AnimStyle = useAnimatedStyle(() => ({
    opacity: ring1Opacity.value,
    transform: [{ scale: ring1Scale.value }],
  }));

  const ring2AnimStyle = useAnimatedStyle(() => ({
    opacity: ring2Opacity.value,
    transform: [{ scale: ring2Scale.value }],
  }));

  const screenAnimStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[styles.root, screenAnimStyle]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[COLORS.primaryDeep, COLORS.primary]}
        style={styles.gradient}
      >
        <Animated.View style={[styles.ring, ring1AnimStyle, { borderColor: COLORS.accentAlpha(0.2) }]} />
        <Animated.View style={[styles.ring, styles.ring2, ring2AnimStyle, { borderColor: COLORS.whiteAlpha(0.1) }]} />

        <View style={styles.content}>
          <Animated.View style={[styles.logoContainer, logoAnimStyle]}>
            <LinearGradient
              colors={COLORS.accentGradient as any}
              style={styles.logoCircle}
            >
              <Ionicons name="star" size={50} color={COLORS.white} />
            </LinearGradient>
          </Animated.View>

          <Animated.Text style={[styles.title, titleAnimStyle]}>
            DREAM TEAM
          </Animated.Text>

          <Animated.Text style={[styles.subtitle, subtitleAnimStyle]}>
            L'Alliance de la Finance Solidaire
          </Animated.Text>

          <Animated.View style={[styles.dotsContainer, dotsAnimStyle]}>
            <View style={[styles.dot, { backgroundColor: COLORS.accent }]} />
            <View style={[styles.dot, styles.dotMiddle]} />
            <View style={[styles.dot, { backgroundColor: COLORS.accent }]} />
          </Animated.View>
        </View>

        <Animated.Text style={[styles.footer, subtitleAnimStyle]}>
          BÂTISSONS ENSEMBLE VOTRE HÉRITAGE
        </Animated.Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center', zIndex: 10 },
  ring: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 1.5,
  },
  ring2: { width: 380, height: 380, borderRadius: 190 },
  logoContainer: { marginBottom: 30, ...SHADOWS.glow },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.whiteAlpha(0.2),
  },
  title: {
    fontSize: 34,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.white,
    letterSpacing: 4,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  dotsContainer: { flexDirection: 'row', marginTop: 40, gap: 10 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotMiddle: { backgroundColor: COLORS.white, width: 20 },
  footer: {
    position: 'absolute',
    bottom: 60,
    fontSize: 10,
    color: COLORS.whiteAlpha(0.4),
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 2,
  },
});
