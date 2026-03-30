/**
 * ============================================================
 * Écran Création de Paiement - Dream Team Mobile
 * Formulaire complet avec sélection du type et du mode
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

/** Options de type de paiement (Valeurs littérales car PaymentType est un Type Union) */
const PAYMENT_TYPES: { value: PaymentType; label: string; icon: string; desc: string }[] = [
  { value: 'INSCRIPTION', label: 'Inscription', icon: '📋', desc: "Frais d'adhésion" },
  { value: 'ASSURANCE', label: 'Fonds de Secours', icon: '🛡️', desc: 'Cotisation assurance' },
  { value: 'TONTINE', label: 'Tontine', icon: '🔄', desc: 'Cotisation tontine' },
  { value: 'EPARGNE', label: 'Épargne', icon: '🐷', desc: 'Dépôt épargne' },
  { value: 'SANCTION', label: 'Sanction', icon: '⚠️', desc: 'Paiement de sanction' },
  { value: 'AUTRE', label: 'Autre', icon: '📦', desc: 'Autre paiement' },
];

/** Options de mode de paiement */
const PAYMENT_MODES: { value: PaymentMode; label: string; color: string; needsPhone: boolean; logo?: any; icon?: any }[] = [
  {
    value: 'ORANGE_MONEY',
    label: 'Orange Money',
    color: '#FF6600',
    needsPhone: true,
    logo: require('../../assets/images/Orange_Money-Logo.wine.png'),
  },
  {
    value: 'MTN_MOMO',
    label: 'MTN Mobile Money',
    color: '#FFCC00',
    needsPhone: true,
    logo: require('../../assets/images/logo_mtn_money.png'),
  },
  {
    value: 'ESPECE',
    label: 'Espèce',
    color: COLORS.gray600,
    needsPhone: false,
    icon: <Banknote size={24} color={COLORS.gray600} />,
  },
  {
    value: 'BANQUE',
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
          updateUser({ memberId: res.data.id, memberMatricule: res.data.matricule });
        }
      } catch (e) {
        console.log('Impossible de récupérer le memberId:', e);
      }
    };
    fetchMemberId();
  }, [user?.memberId]);

  const stepScale = useSharedValue(1);
  const needsPhone = PAYMENT_MODES.find((m) => m.value === selectedMode)?.needsPhone || false;

  const nextStep = () => {
    stepScale.value = withSpring(1, { damping: 12 });
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
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
      Alert.alert('Profil introuvable', 'Contactez l\'administrateur.');
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
        Alert.alert('✅ Succès', 'Paiement créé !', [{ text: 'OK', onPress: () => router.back() }]);
      } else {
        Alert.alert('Erreur', response.message);
      }
    } catch (error: any) {
      Alert.alert('Erreur', 'Impossible de créer le paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.primaryGradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => (step > 1 ? setStep(step - 1) : router.back())}>
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <CreditCard size={28} color={COLORS.white} />
          <Text style={styles.headerTitle}>Paiement</Text>
          <Text style={styles.headerSub}>Étape {step} sur 3</Text>
        </View>

        <View style={styles.progressRow}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={[styles.progressDot, s <= step && styles.progressDotActive, s === step && styles.progressDotCurrent]} />
          ))}
        </View>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.formWrapper}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {step === 1 && (
            <Animated.View entering={FadeIn.duration(400)}>
              <Text style={styles.stepTitle}>Type de paiement</Text>
              <View style={styles.optionsGrid}>
                {PAYMENT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[styles.typeCard, selectedType === type.value && styles.typeCardSelected]}
                    onPress={() => setSelectedType(type.value)}
                  >
                    {selectedType === type.value && <View style={styles.checkMark}><Check size={12} color={COLORS.white} /></View>}
                    <Text style={styles.typeIcon}>{type.icon}</Text>
                    <Text style={[styles.typeLabel, selectedType === type.value && styles.typeLabelSelected]}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.buttonContainer}>
                <GradientButton title="Continuer" onPress={nextStep} disabled={!selectedType} size="lg" />
              </View>
            </Animated.View>
          )}

          {step === 2 && (
            <Animated.View entering={FadeIn.duration(400)}>
              <Text style={styles.stepTitle}>Mode de paiement</Text>
              {PAYMENT_MODES.map((mode) => (
                <TouchableOpacity
                  key={mode.value}
                  style={[styles.modeCard, selectedMode === mode.value && styles.modeCardSelected]}
                  onPress={() => setSelectedMode(mode.value)}
                >
                  <View style={[styles.modeIconBox, { borderColor: mode.color }]}>
                    {mode.logo ? <Image source={mode.logo} style={styles.modeLogo} resizeMode="contain" /> : mode.icon}
                  </View>
                  <View style={styles.modeTexts}>
                    <Text style={styles.modeLabel}>{mode.label}</Text>
                  </View>
                  {selectedMode === mode.value ? <View style={styles.modeCheck}><Check size={16} color={COLORS.white} /></View> : <View style={styles.modeRadio} />}
                </TouchableOpacity>
              ))}
              <View style={styles.buttonContainer}>
                <GradientButton title="Continuer" onPress={nextStep} disabled={!selectedMode} size="lg" />
              </View>
            </Animated.View>
          )}

          {step === 3 && (
            <Animated.View entering={FadeIn.duration(400)}>
              <Text style={styles.stepTitle}>Détails</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Montant (FCFA)</Text>
                <View style={styles.amountContainer}>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0"
                    value={montant}
                    onChangeText={setMontant}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {needsPhone && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Numéro Mobile Money</Text>
                  <View style={styles.inputContainer}>
                    <Smartphone size={20} color={COLORS.gray400} style={{ marginRight: 10 }} />
                    <TextInput
                      style={styles.input}
                      placeholder="237XXXXXXXXX"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              )}

              <View style={styles.buttonContainer}>
                <GradientButton
                  title="Finaliser"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={!montant}
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
  header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20 },
  headerContent: { alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.white, marginTop: 10 },
  headerSub: { fontSize: 14, color: COLORS.white, opacity: 0.8 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  progressRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, gap: 10 },
  progressDot: { width: 20, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  progressDotActive: { backgroundColor: 'rgba(255,255,255,0.7)' },
  progressDotCurrent: { backgroundColor: COLORS.white, width: 40 },
  formWrapper: { flex: 1 },
  scrollContent: { padding: 20 },
  stepTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.gray800, marginBottom: 20 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCard: { width: '48%', backgroundColor: COLORS.white, borderRadius: 15, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: COLORS.gray200 },
  typeCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primarySoft },
  typeIcon: { fontSize: 30, marginBottom: 10 },
  typeLabel: { fontSize: 14, fontWeight: 'bold', color: COLORS.gray700 },
  typeLabelSelected: { color: COLORS.primary },
  checkMark: { position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  modeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 15, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: COLORS.gray200 },
  modeCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primarySoft },
  modeIconBox: { width: 50, height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginRight: 15 },
  modeLogo: { width: 40, height: 40 },
  modeTexts: { flex: 1 },
  modeLabel: { fontSize: 16, fontWeight: '600', color: COLORS.gray700 },
  modeCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  modeRadio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.gray300 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.gray600, marginBottom: 8 },
  amountContainer: { height: 60, backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.gray200, paddingHorizontal: 15, justifyContent: 'center' },
  amountInput: { fontSize: 24, fontWeight: 'bold', color: COLORS.gray800 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.gray200, paddingHorizontal: 15, height: 55 },
  input: { flex: 1, fontSize: 16, color: COLORS.gray800 },
  buttonContainer: { marginTop: 30 }
});
