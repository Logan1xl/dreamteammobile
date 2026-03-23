/**
 * ============================================================
 * Écran Création de Paiement - Dream Team Mobile
 * Formulaire complet avec sélection du type (inscription,
 * assurance, tontine...), du mode (OM, MTN, espèce) avec
 * logos et numéro de téléphone pour Mobile Money
 * ============================================================
 */
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  Check,
  ChevronDown,
} from 'lucide-react-native';
import { createPayment } from '../../src/api/payments';
import { getMyMemberProfile } from '../../src/api/members';
import { useAuthStore } from '../../src/store/useAuthStore';
import GradientButton from '../../src/components/common/GradientButton';
import { PaymentType, PaymentMode } from '../../src/types';
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOWS,
} from '../../src/theme/theme';

/** Options de type de paiement */
const PAYMENT_TYPES = [
  { value: PaymentType.INSCRIPTION, label: 'Inscription', icon: '📋', desc: "Frais d'adhésion" },
  { value: PaymentType.ASSURANCE, label: 'Fonds de Secours', icon: '🛡️', desc: 'Cotisation assurance' },
  { value: PaymentType.TONTINE, label: 'Tontine', icon: '🔄', desc: 'Cotisation tontine' },
  { value: PaymentType.EPARGNE, label: 'Épargne', icon: '🐷', desc: 'Dépôt épargne' },
  { value: PaymentType.SANCTION, label: 'Sanction', icon: '⚠️', desc: 'Paiement de sanction' },
  { value: PaymentType.AUTRE, label: 'Autre', icon: '📦', desc: 'Autre paiement' },
];

/** Options de mode de paiement */
const PAYMENT_MODES = [
  {
    value: PaymentMode.ORANGE_MONEY,
    label: 'Orange Money',
    color: COLORS.orangeMoney,
    needsPhone: true,
    logo: require('../../assets/images/Orange_Money-Logo.wine.png'),
  },
  {
    value: PaymentMode.MTN_MOMO,
    label: 'MTN Mobile Money',
    color: COLORS.mtnMomoText,
    needsPhone: true,
    logo: require('../../assets/images/logo_mtn_money.png'),
  },
  {
    value: PaymentMode.ESPECE,
    label: 'Espèce',
    color: COLORS.gray600,
    needsPhone: false,
    icon: <Banknote size={24} color={COLORS.gray600} />,
  },
  {
    value: PaymentMode.BANQUE,
    label: 'Virement bancaire',
    color: COLORS.info,
    needsPhone: false,
    icon: <Building2 size={24} color={COLORS.info} />,
  },
];

export default function CreatePaymentScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  // État du formulaire
  const [selectedType, setSelectedType] = useState<PaymentType | null>(null);
  const [selectedMode, setSelectedMode] = useState<PaymentMode | null>(null);
  const [montant, setMontant] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [lieu, setLieu] = useState('DISTANCE');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [resolvedMemberId, setResolvedMemberId] = useState<string | null>(user?.memberId || null);

  /**
   * Si memberId n'est pas dans le store, on le récupère via /members/me
   */
  useEffect(() => {
    const fetchMemberId = async () => {
      if (user?.memberId) {
        setResolvedMemberId(user.memberId);
        return;
      }
      try {
        const res = await getMyMemberProfile();
        if (res.success && res.data?.id) {
          setResolvedMemberId(res.data.id);
          // Mettre à jour le store pour les prochains usages
          updateUser({ memberId: res.data.id, memberMatricule: res.data.matricule });
        }
      } catch (e) {
        console.log('Impossible de récupérer le memberId:', e);
      }
    };
    fetchMemberId();
  }, [user?.memberId]);

  // Animation d'étape
  const stepScale = useSharedValue(1);

  /**
   * Vérifie si le mode sélectionné nécessite un numéro de téléphone
   */
  const needsPhone = PAYMENT_MODES.find((m) => m.value === selectedMode)?.needsPhone || false;

  /**
   * Passe à l'étape suivante avec animation
   */
  const nextStep = () => {
    stepScale.value = withSpring(1, { damping: 12 });
    setStep((s) => s + 1);
  };

  /**
   * Validation et soumission du paiement
   */
  const handleSubmit = async () => {
    // Validations
    if (!selectedType || !selectedMode) {
      Alert.alert('Erreur', 'Veuillez sélectionner le type et le mode de paiement');
      return;
    }
    if (!montant || parseFloat(montant) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }
    if (needsPhone && !phoneNumber.trim()) {
      Alert.alert('Erreur', 'Le numéro de téléphone est requis pour Mobile Money');
      return;
    }
    if (!resolvedMemberId) {
      Alert.alert(
        'Profil membre introuvable',
        'Votre compte n\'est pas encore associé à un profil membre. Contactez l\'administrateur de l\'association.'
      );
      return;
    }

    setLoading(true);
    try {
      const response = await createPayment({
        memberId: resolvedMemberId,
        typePaiement: selectedType,
        modePaiement: selectedMode,
        lieu,
        montant: parseFloat(montant),
        phoneNumber: needsPhone ? phoneNumber.trim() : undefined,
      });

      if (response.success) {
        Alert.alert(
          '✅ Paiement créé !',
          response.message || 'Votre paiement a été soumis et est en attente de validation.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Erreur', response.message || 'Erreur lors du paiement');
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Impossible de créer le paiement';
      Alert.alert('Erreur', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={COLORS.primaryGradient as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={[styles.bgCircle, styles.bgCircle1]} />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (step > 1 ? setStep(step - 1) : router.back())}
        >
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <CreditCard size={28} color={COLORS.white} />
          <Text style={styles.headerTitle}>Nouveau Paiement</Text>
          <Text style={styles.headerSub}>Étape {step} sur 3</Text>
        </View>

        {/* Indicateur de progression */}
        <View style={styles.progressRow}>
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={[
                styles.progressDot,
                s <= step && styles.progressDotActive,
                s === step && styles.progressDotCurrent,
              ]}
            />
          ))}
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formWrapper}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* === ÉTAPE 1 : Sélection du type === */}
          {step === 1 && (
            <Animated.View entering={FadeIn.duration(400)}>
              <Text style={styles.stepTitle}>Quel type de paiement ?</Text>
              <Text style={styles.stepDesc}>
                Sélectionnez la catégorie de votre paiement
              </Text>

              <View style={styles.optionsGrid}>
                {PAYMENT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeCard,
                      selectedType === type.value && styles.typeCardSelected,
                    ]}
                    onPress={() => setSelectedType(type.value)}
                    activeOpacity={0.7}
                  >
                    {selectedType === type.value && (
                      <View style={styles.checkMark}>
                        <Check size={14} color={COLORS.white} />
                      </View>
                    )}
                    <Text style={styles.typeIcon}>{type.icon}</Text>
                    <Text
                      style={[
                        styles.typeLabel,
                        selectedType === type.value && styles.typeLabelSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                    <Text style={styles.typeDesc}>{type.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.buttonContainer}>
                <GradientButton
                  title="Continuer"
                  onPress={nextStep}
                  disabled={!selectedType}
                  size="lg"
                />
              </View>
            </Animated.View>
          )}

          {/* === ÉTAPE 2 : Sélection du mode === */}
          {step === 2 && (
            <Animated.View entering={FadeIn.duration(400)}>
              <Text style={styles.stepTitle}>Mode de paiement</Text>
              <Text style={styles.stepDesc}>
                Comment souhaitez-vous payer ?
              </Text>

              {PAYMENT_MODES.map((mode) => (
                <TouchableOpacity
                  key={mode.value}
                  style={[
                    styles.modeCard,
                    selectedMode === mode.value && styles.modeCardSelected,
                  ]}
                  onPress={() => setSelectedMode(mode.value)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.modeIconBox, { borderColor: mode.color }]}>
                    {mode.logo ? (
                      <Image
                        source={mode.logo}
                        style={styles.modeLogo}
                        resizeMode="contain"
                      />
                    ) : (
                      mode.icon
                    )}
                  </View>
                  <View style={styles.modeTexts}>
                    <Text style={styles.modeLabel}>{mode.label}</Text>
                    {mode.needsPhone && (
                      <Text style={styles.modeHint}>
                        Numéro de téléphone requis
                      </Text>
                    )}
                  </View>
                  {selectedMode === mode.value ? (
                    <View style={styles.modeCheck}>
                      <Check size={16} color={COLORS.white} />
                    </View>
                  ) : (
                    <View style={styles.modeRadio} />
                  )}
                </TouchableOpacity>
              ))}

              <View style={styles.buttonContainer}>
                <GradientButton
                  title="Continuer"
                  onPress={nextStep}
                  disabled={!selectedMode}
                  size="lg"
                />
              </View>
            </Animated.View>
          )}

          {/* === ÉTAPE 3 : Détails du paiement === */}
          {step === 3 && (
            <Animated.View entering={FadeIn.duration(400)}>
              <Text style={styles.stepTitle}>Détails du paiement</Text>
              <Text style={styles.stepDesc}>
                Renseignez les informations de paiement
              </Text>

              {/* Résumé des choix */}
              <View style={styles.summaryBox}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Type</Text>
                  <Text style={styles.summaryValue}>
                    {PAYMENT_TYPES.find((t) => t.value === selectedType)?.label}
                  </Text>
                </View>
                <View style={styles.summarySeparator} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Mode</Text>
                  <Text style={styles.summaryValue}>
                    {PAYMENT_MODES.find((m) => m.value === selectedMode)?.label}
                  </Text>
                </View>
              </View>

              {/* Champ Montant */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Montant (FCFA) *</Text>
                <View style={styles.amountContainer}>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0"
                    placeholderTextColor={COLORS.gray300}
                    value={montant}
                    onChangeText={setMontant}
                    keyboardType="numeric"
                  />
                  <Text style={styles.currencyLabel}>FCFA</Text>
                </View>
              </View>

              {/* Champ Numéro de téléphone (si Mobile Money) */}
              {needsPhone && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Numéro Mobile Money *</Text>
                  <View style={styles.inputContainer}>
                    <Smartphone
                      size={20}
                      color={COLORS.gray400}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: 237670123456"
                      placeholderTextColor={COLORS.gray400}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <Text style={styles.hint}>
                    Format : 237XXXXXXXXX (ex: 237670123456)
                  </Text>
                </View>
              )}

              {/* Lieu */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Lieu</Text>
                <View style={styles.lieuRow}>
                  <TouchableOpacity
                    style={[
                      styles.lieuOption,
                      lieu === 'DISTANCE' && styles.lieuOptionActive,
                    ]}
                    onPress={() => setLieu('DISTANCE')}
                  >
                    <Text
                      style={[
                        styles.lieuText,
                        lieu === 'DISTANCE' && styles.lieuTextActive,
                      ]}
                    >
                      À distance
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.lieuOption,
                      lieu === 'PRESENTIEL' && styles.lieuOptionActive,
                    ]}
                    onPress={() => setLieu('PRESENTIEL')}
                  >
                    <Text
                      style={[
                        styles.lieuText,
                        lieu === 'PRESENTIEL' && styles.lieuTextActive,
                      ]}
                    >
                      En présentiel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Bouton Soumettre */}
              <View style={styles.buttonContainer}>
                <GradientButton
                  title={`Payer ${montant ? new Intl.NumberFormat('fr-FR').format(parseFloat(montant) || 0) + ' FCFA' : ''}`}
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={!montant || parseFloat(montant) <= 0}
                  size="lg"
                  variant="success"
                />
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  // Header
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: COLORS.whiteAlpha(0.08),
  },
  bgCircle1: { width: 200, height: 200, top: -50, right: -60 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.whiteAlpha(0.2),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerContent: { alignItems: 'center' },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.white,
    marginTop: SPACING.sm,
  },
  headerSub: {
    fontSize: FONT_SIZE.md,
    color: COLORS.whiteAlpha(0.8),
    marginTop: SPACING.xs,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  progressDot: {
    width: 30,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.whiteAlpha(0.3),
  },
  progressDotActive: {
    backgroundColor: COLORS.whiteAlpha(0.7),
  },
  progressDotCurrent: {
    backgroundColor: COLORS.white,
    width: 50,
  },
  // Formulaire
  formWrapper: { flex: 1, marginTop: -SPACING.md },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  stepTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray800,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  stepDesc: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray500,
    marginBottom: SPACING.lg,
  },
  // Types grille
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  typeCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gray200,
    marginBottom: SPACING.sm,
    ...SHADOWS.light,
  },
  typeCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
  },
  checkMark: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  typeLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray700,
    textAlign: 'center',
  },
  typeLabelSelected: {
    color: COLORS.primary,
  },
  typeDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray400,
    textAlign: 'center',
    marginTop: 4,
  },
  // Modes
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    ...SHADOWS.light,
  },
  modeCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
  },
  modeIconBox: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    backgroundColor: COLORS.white,
    marginRight: SPACING.md,
  },
  modeLogo: {
    width: 36,
    height: 36,
  },
  modeTexts: { flex: 1 },
  modeLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.gray700,
  },
  modeHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray400,
    marginTop: 2,
  },
  modeCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeRadio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: COLORS.gray300,
  },
  // Détails
  summaryBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.light,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  summarySeparator: {
    height: 1,
    backgroundColor: COLORS.gray100,
  },
  summaryLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
  },
  summaryValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray800,
  },
  // Inputs
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.gray600,
    marginBottom: SPACING.sm,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    paddingHorizontal: SPACING.lg,
    height: 64,
    ...SHADOWS.light,
  },
  amountInput: {
    flex: 1,
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.gray800,
  },
  currencyLabel: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray400,
    marginLeft: SPACING.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    paddingHorizontal: SPACING.md,
    height: 52,
  },
  inputIcon: { marginRight: SPACING.sm },
  input: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.gray800,
  },
  hint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray400,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  // Lieu
  lieuRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  lieuOption: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  lieuOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
  },
  lieuText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.gray500,
  },
  lieuTextActive: {
    color: COLORS.primary,
  },
  buttonContainer: {
    marginTop: SPACING.xl,
  },
});
