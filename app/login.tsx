/**
 * ============================================================
 * Écran de Connexion - Dream Team Mobile
 * Design premium avec animation d'entrée, dégradé de fond,
 * et intégration complète avec le backend (Login API)
 * ============================================================
 */
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  FadeIn,
  SlideInUp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react-native';
import { login as loginApi } from '../src/api/auth';
import { useAuthStore } from '../src/store/useAuthStore';
import GradientButton from '../src/components/common/GradientButton';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../src/theme/theme';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const loginStore = useAuthStore((s) => s.login);

  // État du formulaire
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Animations d'entrée
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(40);

  useEffect(() => {
    formOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    formTranslateY.value = withDelay(
      200,
      withSpring(0, { damping: 18, stiffness: 100 })
    );
  }, []);

  const formAnimStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  /**
   * Valide les champs du formulaire
   */
  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!emailOrPhone.trim()) {
      newErrors.email = 'Email ou téléphone requis';
    }
    if (!password.trim()) {
      newErrors.password = 'Mot de passe requis';
    } else if (password.length < 6) {
      newErrors.password = 'Minimum 6 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Soumet la connexion au backend
   */
  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await loginApi({
        emailOrPhone: emailOrPhone.trim(),
        password,
      });

      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data;
        // Stocker l'utilisateur et les tokens dans le store
        loginStore(user, accessToken, refreshToken);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Erreur', response.message || 'Identifiants incorrects');
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Impossible de se connecter. Vérifiez vos identifiants.';
      Alert.alert('Erreur de connexion', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* En-tête avec dégradé */}
      <LinearGradient
        colors={COLORS.primaryGradient as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* Cercles décoratifs */}
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />

        {/* Logo et texte d'accueil */}
        <Animated.View
          entering={FadeIn.delay(100).duration(600)}
          style={styles.headerContent}
        >
          <View style={styles.logoWrapper}>
            <Image
              source={require('../assets/images/logo_dream_team.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.welcomeText}>Bienvenue</Text>
          <Text style={styles.welcomeSubtext}>
            Connectez-vous pour accéder à votre espace
          </Text>
        </Animated.View>
      </LinearGradient>

      {/* Formulaire de connexion */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formWrapper}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.form, formAnimStyle]}>
            <Text style={styles.formTitle}>Connexion</Text>

            {/* Champ Email / Téléphone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email ou Téléphone</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.email ? styles.inputError : null,
                ]}
              >
                <Mail size={20} color={COLORS.gray400} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="exemple@email.com"
                  placeholderTextColor={COLORS.gray400}
                  value={emailOrPhone}
                  onChangeText={(t) => {
                    setEmailOrPhone(t);
                    if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Champ Mot de passe */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.password ? styles.inputError : null,
                ]}
              >
                <Lock size={20} color={COLORS.gray400} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.gray400}
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
                  }}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={COLORS.gray400} />
                  ) : (
                    <Eye size={20} color={COLORS.gray400} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Bouton de connexion */}
            <View style={styles.buttonContainer}>
              <GradientButton
                title="Se connecter"
                onPress={handleLogin}
                loading={loading}
                icon={<ArrowRight size={20} color={COLORS.white} />}
                size="lg"
              />
            </View>

            {/* Lien vers inscription */}
            <View style={styles.registerLink}>
              <Text style={styles.registerText}>Pas encore de compte ?</Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.registerButton}> S'inscrire</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Header dégradé
  header: {
    height: height * 0.38,
    justifyContent: 'flex-end',
    paddingBottom: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
    overflow: 'hidden',
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  // Cercles décoratifs
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: COLORS.whiteAlpha(0.08),
  },
  circle1: {
    width: 200,
    height: 200,
    top: -40,
    right: -60,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: 20,
    left: -50,
  },
  circle3: {
    width: 80,
    height: 80,
    top: 60,
    left: 40,
  },
  // Logo
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.whiteAlpha(0.2),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.whiteAlpha(0.3),
  },
  logo: {
    width: 50,
    height: 50,
  },
  welcomeText: {
    fontSize: FONT_SIZE.hero,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  welcomeSubtext: {
    fontSize: FONT_SIZE.md,
    color: COLORS.whiteAlpha(0.8),
    textAlign: 'center',
  },
  // Formulaire
  formWrapper: {
    flex: 1,
    marginTop: -SPACING.xl,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
  },
  form: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    ...SHADOWS.heavy,
  },
  formTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.black,
    marginBottom: SPACING.lg,
  },
  // Champs
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.gray600,
    marginBottom: SPACING.xs + 2,
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    paddingHorizontal: SPACING.md,
    height: 52,
  },
  inputError: {
    borderColor: COLORS.danger,
    backgroundColor: COLORS.dangerLight,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.black,
  },
  eyeButton: {
    padding: SPACING.xs,
  },
  errorText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.danger,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  // Bouton
  buttonContainer: {
    marginTop: SPACING.lg,
  },
  // Lien inscription
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  registerText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray500,
  },
  registerButton: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
});
