/**
 * ============================================================
 * Écran d'Inscription - Dream Team Mobile
 * Design premium avec formulaire complet, validation en temps
 * réel et intégration API Register
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
  Alert,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  UserPlus,
  ArrowLeft,
} from 'lucide-react-native';
import { register as registerApi } from '../src/api/auth';
import { useAuthStore } from '../src/store/useAuthStore';
import GradientButton from '../src/components/common/GradientButton';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../src/theme/theme';

const { height } = Dimensions.get('window');

/** Champ de formulaire individuel */
interface FieldConfig {
  key: string;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  secure?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words';
}

export default function RegisterScreen() {
  const router = useRouter();
  const loginStore = useAuthStore((s) => s.login);

  // État du formulaire
  const [form, setForm] = useState({
    nom: '',
    prenoms: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Animation d'entrée
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);

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
   * Met à jour un champ du formulaire et efface l'erreur associée
   */
  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }
  };

  /**
   * Validation complète du formulaire
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!form.prenoms.trim()) newErrors.prenoms = 'Les prénoms sont requis';

    if (!form.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Email invalide';
    }

    if (form.telephone && !/^(\+237|237)?[26][0-9]{8}$/.test(form.telephone)) {
      newErrors.telephone = 'Format : 6XXXXXXXX ou +237XXXXXXXXX';
    }

    if (!form.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (form.password.length < 8) {
      newErrors.password = 'Minimum 8 caractères';
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Soumet l'inscription au backend
   */
  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await registerApi({
        nom: form.nom.trim(),
        prenoms: form.prenoms.trim(),
        email: form.email.trim(),
        password: form.password,
        telephone: form.telephone.trim() || undefined,
      });

      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data;
        loginStore(user, accessToken, refreshToken);
        Alert.alert('🎉 Bienvenue !', 'Votre compte a été créé avec succès.', [
          { text: 'Continuer', onPress: () => router.replace('/(tabs)') },
        ]);
      } else {
        Alert.alert('Erreur', response.message || "Erreur lors de l'inscription");
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Impossible de créer le compte.";
      Alert.alert("Erreur d'inscription", message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Rend un champ de saisie avec icône et gestion d'erreur
   */
  const renderField = (config: FieldConfig) => {
    const value = form[config.key as keyof typeof form];
    const error = errors[config.key];
    const isPassword = config.secure;
    const showPw = config.key === 'password' ? showPassword : showConfirm;
    const togglePw =
      config.key === 'password'
        ? () => setShowPassword(!showPassword)
        : () => setShowConfirm(!showConfirm);

    return (
      <View style={styles.inputGroup} key={config.key}>
        <Text style={styles.label}>{config.label}</Text>
        <View style={[styles.inputContainer, error ? styles.inputError : null]}>
          <View style={styles.inputIcon}>{config.icon}</View>
          <TextInput
            style={styles.input}
            placeholder={config.placeholder}
            placeholderTextColor={COLORS.gray400}
            value={value}
            onChangeText={(t) => updateField(config.key, t)}
            keyboardType={config.keyboardType || 'default'}
            autoCapitalize={config.autoCapitalize || 'sentences'}
            secureTextEntry={isPassword && !showPw}
          />
          {isPassword && (
            <TouchableOpacity onPress={togglePw} style={styles.eyeBtn}>
              {showPw ? (
                <EyeOff size={20} color={COLORS.gray400} />
              ) : (
                <Eye size={20} color={COLORS.gray400} />
              )}
            </TouchableOpacity>
          )}
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  };

  // Configuration des champs
  const fields: FieldConfig[] = [
    {
      key: 'nom',
      label: 'Nom',
      placeholder: 'Votre nom de famille',
      icon: <User size={20} color={COLORS.gray400} />,
      autoCapitalize: 'words',
    },
    {
      key: 'prenoms',
      label: 'Prénoms',
      placeholder: 'Vos prénoms',
      icon: <User size={20} color={COLORS.gray400} />,
      autoCapitalize: 'words',
    },
    {
      key: 'email',
      label: 'Email',
      placeholder: 'exemple@email.com',
      icon: <Mail size={20} color={COLORS.gray400} />,
      keyboardType: 'email-address',
      autoCapitalize: 'none',
    },
    {
      key: 'telephone',
      label: 'Téléphone (optionnel)',
      placeholder: '6XXXXXXXX',
      icon: <Phone size={20} color={COLORS.gray400} />,
      keyboardType: 'phone-pad',
    },
    {
      key: 'password',
      label: 'Mot de passe',
      placeholder: 'Minimum 8 caractères',
      icon: <Lock size={20} color={COLORS.gray400} />,
      secure: true,
      autoCapitalize: 'none',
    },
    {
      key: 'confirmPassword',
      label: 'Confirmer le mot de passe',
      placeholder: 'Confirmez le mot de passe',
      icon: <Lock size={20} color={COLORS.gray400} />,
      secure: true,
      autoCapitalize: 'none',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header dégradé compact */}
      <LinearGradient
        colors={COLORS.primaryGradient as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />

        {/* Bouton retour */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.iconCircle}>
            <UserPlus size={32} color={COLORS.white} />
          </View>
          <Text style={styles.headerTitle}>Créer un compte</Text>
          <Text style={styles.headerSub}>
            Rejoignez Dream Team en quelques étapes
          </Text>
        </View>
      </LinearGradient>

      {/* Formulaire */}
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
            {fields.map(renderField)}

            {/* Bouton inscription */}
            <View style={styles.buttonContainer}>
              <GradientButton
                title="Créer mon compte"
                onPress={handleRegister}
                loading={loading}
                icon={<UserPlus size={20} color={COLORS.white} />}
                size="lg"
              />
            </View>

            {/* Lien vers connexion */}
            <View style={styles.loginLink}>
              <Text style={styles.loginText}>Déjà un compte ?</Text>
              <TouchableOpacity onPress={() => router.replace('/login')}>
                <Text style={styles.loginButton}> Se connecter</Text>
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
  // Header
  header: {
    height: height * 0.28,
    justifyContent: 'flex-end',
    paddingBottom: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
    overflow: 'hidden',
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: SPACING.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.whiteAlpha(0.2),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: COLORS.whiteAlpha(0.08),
  },
  circle1: { width: 180, height: 180, top: -30, right: -50 },
  circle2: { width: 120, height: 120, bottom: 10, left: -40 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.whiteAlpha(0.2),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSub: {
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  form: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    ...SHADOWS.heavy,
  },
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
  eyeBtn: {
    padding: SPACING.xs,
  },
  errorText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.danger,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  buttonContainer: {
    marginTop: SPACING.lg,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  loginText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray500,
  },
  loginButton: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
});
