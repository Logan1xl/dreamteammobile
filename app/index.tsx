/**
 * ============================================================
 * Splash Screen Animé - Dream Team Mobile
 * Animation d'entrée avec logo pulsant, texte progressif
 * et transition fluide vers l'écran de connexion ou le dashboard
 * ============================================================
 */
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Image, Dimensions } from 'react-native';
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
import { useAuthStore } from '../src/store/useAuthStore';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../src/theme/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setLoading = useAuthStore((s) => s.setLoading);

  // Valeurs d'animation partagées
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

  /**
   * Navigation vers l'écran approprié après l'animation
   */
  const navigateAway = () => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/login');
    }
  };

  useEffect(() => {
    // Séquence d'animations :

    // 1. Anneaux pulsants en fond (dès le début)
    ring1Opacity.value = withDelay(200, withTiming(0.15, { duration: 600 }));
    ring1Scale.value = withDelay(
      200,
      withRepeat(withTiming(1.5, { duration: 2000 }), -1, true)
    );
    ring2Opacity.value = withDelay(500, withTiming(0.1, { duration: 600 }));
    ring2Scale.value = withDelay(
      500,
      withRepeat(withTiming(1.8, { duration: 2500 }), -1, true)
    );

    // 2. Logo : apparition avec effet de rebond
    logoOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    logoScale.value = withDelay(
      300,
      withSequence(
        withSpring(1.15, { damping: 8, stiffness: 150 }),
        withSpring(1, { damping: 12, stiffness: 100 })
      )
    );

    // 3. Titre : slide-up + fade-in
    titleOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    titleTranslateY.value = withDelay(
      800,
      withSpring(0, { damping: 15, stiffness: 100 })
    );

    // 4. Sous-titre : fade-in
    subtitleOpacity.value = withDelay(1200, withTiming(1, { duration: 500 }));

    // 5. Points de chargement : fade-in pulsant
    dotsOpacity.value = withDelay(
      1500,
      withRepeat(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );

    // 6. Transition de sortie après 3 secondes
    screenOpacity.value = withDelay(
      3000,
      withTiming(0, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(navigateAway)();
          runOnJS(setLoading)(false);
        }
      })
    );
  }, []);

  // Styles animés
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
      <LinearGradient
        colors={['#667eea', '#5a67d8', '#764ba2'] as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Anneaux pulsants décoratifs */}
        <Animated.View style={[styles.ring, ring1AnimStyle]} />
        <Animated.View style={[styles.ring, styles.ring2, ring2AnimStyle]} />

        {/* Contenu principal */}
        <View style={styles.content}>
          {/* Logo */}
          <Animated.View style={[styles.logoContainer, logoAnimStyle]}>
            <View style={styles.logoCircle}>
              <Image
                source={require('../assets/images/logo_dream_team.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          {/* Titre */}
          <Animated.Text style={[styles.title, titleAnimStyle]}>
            Dream Team
          </Animated.Text>

          {/* Sous-titre */}
          <Animated.Text style={[styles.subtitle, subtitleAnimStyle]}>
            Gestion d'association simplifiée
          </Animated.Text>

          {/* Points de chargement */}
          <Animated.View style={[styles.dotsContainer, dotsAnimStyle]}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotMiddle]} />
            <View style={styles.dot} />
          </Animated.View>
        </View>

        {/* Footer */}
        <Animated.Text style={[styles.footer, subtitleAnimStyle]}>
          © 2026 Dream Team Association
        </Animated.Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    zIndex: 2,
  },
  // Anneaux décoratifs pulsants
  ring: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 2,
    borderColor: COLORS.whiteAlpha(0.3),
  },
  ring2: {
    width: 350,
    height: 350,
    borderRadius: 175,
  },
  // Logo
  logoContainer: {
    marginBottom: SPACING.lg,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.whiteAlpha(0.15),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.whiteAlpha(0.3),
  },
  logo: {
    width: 80,
    height: 80,
  },
  // Textes
  title: {
    fontSize: 38,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.white,
    letterSpacing: 2,
    marginBottom: SPACING.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.whiteAlpha(0.8),
    fontWeight: FONT_WEIGHT.medium,
    letterSpacing: 0.5,
  },
  // Points de chargement
  dotsContainer: {
    flexDirection: 'row',
    marginTop: SPACING.xxl,
    gap: SPACING.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.whiteAlpha(0.6),
  },
  dotMiddle: {
    backgroundColor: COLORS.white,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 50,
    fontSize: FONT_SIZE.xs,
    color: COLORS.whiteAlpha(0.5),
    letterSpacing: 0.5,
  },
});
