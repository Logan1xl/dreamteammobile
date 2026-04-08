import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInRight, FadeOutLeft, Layout } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../src/theme/theme';
import { submitApplication } from '../src/api/members';
import { PaymentMode } from '../src/types';

const { width } = Dimensions.get('window');

const STEPS = [
  { id: 1, title: 'Identité', icon: 'person-outline' },
  { id: 2, title: 'Contact', icon: 'mail-outline' },
  { id: 3, title: 'Adhésion', icon: 'shield-checkmark-outline' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [form, setForm] = useState({
    cni: '',
    nom: '',
    prenoms: '',
    email: '',
    telephone: '',
    quartier: '',
    modePaiement: 'ORANGE_MONEY' as PaymentMode,
    password: '',
    confirmPassword: '',
  });

  const nextStep = () => {
    if (step === 1 && (!form.cni || !form.nom || !form.prenoms)) {
      Alert.alert('Champs requis', 'Veuillez remplir les informations d\'identité.');
      return;
    }
    if (step === 2 && (!form.email || !form.telephone || !form.quartier)) {
      Alert.alert('Champs requis', 'Veuillez remplir les informations de contact.');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleRegister = async () => {
    if (!form.password || form.password !== form.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);
    try {
      // Nettoyer les données pour le backend (retirer confirmPassword)
      const { confirmPassword, ...submitData } = form;
      
      const res = await submitApplication(submitData);
      if (res.success) {
        Alert.alert(
          'Candidature Soumise !',
          'Votre demande est en cours de traitement par l\'administration. Vous recevrez une notification dès validation.',
          [{ text: 'Compris', onPress: () => router.replace('/login') }]
        );
      } else {
        Alert.alert('Erreur', res.message || 'Échec de la soumission');
      }
    } catch (e) {
      Alert.alert('Erreur', 'Connexion au serveur impossible');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepperContainer}>
      {STEPS.map((s, i) => (
        <React.Fragment key={s.id}>
          <View style={styles.stepWrapper}>
            <View style={[
              styles.stepCircle, 
              step >= s.id ? styles.stepCircleActive : styles.stepCircleInactive
            ]}>
              <Ionicons 
                name={s.icon as any} 
                size={18} 
                color={step >= s.id ? COLORS.white : COLORS.gray400} 
              />
            </View>
            <Text style={[
              styles.stepText, 
              step >= s.id ? styles.stepTextActive : styles.stepTextInactive
            ]}>
              {s.title}
            </Text>
          </View>
          {i < STEPS.length - 1 && (
            <View style={[
              styles.stepLine, 
              step > s.id ? styles.stepLineActive : styles.stepLineInactive
            ]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={[COLORS.primaryDeep, COLORS.primary]} style={StyleSheet.absoluteFill} />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => step > 1 ? prevStep() : router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Devenir Membre</Text>
            <Text style={styles.subtitle}>Rejoignez l'élite de la finance solidaire</Text>
          </View>

          {renderStepIndicator()}

          <Animated.View layout={Layout.springify()} style={styles.formCard}>
            {step === 1 && (
              <Animated.View entering={FadeInRight} exiting={FadeOutLeft} key="step1">
                <Text style={styles.stepTitle}>Identité Officielle</Text>
                
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>NUMÉRO CNI</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="card-outline" size={20} color={COLORS.gray400} style={styles.inputIcon} />
                    <TextInput 
                      style={styles.input} 
                      placeholder="Numéro de Carte d'Identité" 
                      value={form.cni} 
                      onChangeText={(v) => setForm({...form, cni: v})} 
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>NOM</Text>
                    <View style={styles.inputContainer}>
                      <TextInput 
                        style={styles.input} 
                        placeholder="Nom" 
                        value={form.nom} 
                        onChangeText={(v) => setForm({...form, nom: v})} 
                      />
                    </View>
                  </View>
                  <View style={[styles.inputWrapper, { flex: 1 }]}>
                    <Text style={styles.label}>PRÉNOMS</Text>
                    <View style={styles.inputContainer}>
                      <TextInput 
                        style={styles.input} 
                        placeholder="Prénoms" 
                        value={form.prenoms} 
                        onChangeText={(v) => setForm({...form, prenoms: v})} 
                      />
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity style={styles.mainBtn} onPress={nextStep}>
                  <Text style={styles.mainBtnText}>Continuer</Text>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
                </TouchableOpacity>
              </Animated.View>
            )}

            {step === 2 && (
              <Animated.View entering={FadeInRight} exiting={FadeOutLeft} key="step2">
                <Text style={styles.stepTitle}>Contact & Résidence</Text>
                
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>EMAIL</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color={COLORS.gray400} style={styles.inputIcon} />
                    <TextInput 
                      style={styles.input} 
                      placeholder="votre@email.com" 
                      value={form.email} 
                      onChangeText={(v) => setForm({...form, email: v})} 
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>TÉLÉPHONE</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="call-outline" size={20} color={COLORS.gray400} style={styles.inputIcon} />
                    <TextInput 
                      style={styles.input} 
                      placeholder="6XXXXXXXX" 
                      value={form.telephone} 
                      onChangeText={(v) => setForm({...form, telephone: v})} 
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>QUARTIER</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="location-outline" size={20} color={COLORS.gray400} style={styles.inputIcon} />
                    <TextInput 
                      style={styles.input} 
                      placeholder="Ex: Bastos, Bonapriso..." 
                      value={form.quartier} 
                      onChangeText={(v) => setForm({...form, quartier: v})} 
                    />
                  </View>
                </View>
                
                <TouchableOpacity style={styles.mainBtn} onPress={nextStep}>
                  <Text style={styles.mainBtnText}>Continuer</Text>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
                </TouchableOpacity>
              </Animated.View>
            )}

            {step === 3 && (
              <Animated.View entering={FadeInRight} exiting={FadeOutLeft} key="step3">
                <Text style={styles.stepTitle}>Préférences & Sécurité</Text>
                
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>MODE DE PAIEMENT PRÉFÉRÉ</Text>
                  <View style={styles.paymentPicker}>
                    {(['ORANGE_MONEY', 'MTN_MOMO', 'ESPECE'] as PaymentMode[]).map((mode) => (
                      <TouchableOpacity 
                        key={mode}
                        style={[styles.paymentOption, form.modePaiement === mode && styles.paymentOptionActive]}
                        onPress={() => setForm({...form, modePaiement: mode})}
                      >
                        <Text style={[styles.paymentText, form.modePaiement === mode && styles.paymentTextActive]}>
                          {mode.replace('_', ' ')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>MOT DE PASSE (FUTUR COMPTE)</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray400} style={styles.inputIcon} />
                    <TextInput 
                      style={[styles.input, { flex: 1 }]} 
                      placeholder="••••••••" 
                      value={form.password} 
                      onChangeText={(v) => setForm({...form, password: v})} 
                      secureTextEntry={!showPassword} 
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.gray400} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>CONFIRMATION</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.gray400} style={styles.inputIcon} />
                    <TextInput 
                      style={styles.input} 
                      placeholder="••••••••" 
                      value={form.confirmPassword} 
                      onChangeText={(v) => setForm({...form, confirmPassword: v})} 
                      secureTextEntry={!showPassword} 
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.mainBtn, styles.submitBtn, isLoading && { opacity: 0.7 }]} 
                  onPress={handleRegister} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <>
                      <Text style={styles.mainBtnText}>Soumettre Candidature</Text>
                      <Ionicons name="send" size={18} color={COLORS.white} />
                    </>
                  )}
                </TouchableOpacity>
                
                <Text style={styles.privacyNote}>
                  En soumettant ce formulaire, vous acceptez les conditions d'adhésion à l'association.
                </Text>
              </Animated.View>
            )}
          </Animated.View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà membre ?</Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginText}> Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  backBtn: { marginBottom: 20, width: 40, height: 40, justifyContent: 'center' },
  header: { marginBottom: 30 },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.white, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: COLORS.accent, fontWeight: '600', marginTop: 4 },
  
  stepperContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, paddingHorizontal: 10 },
  stepWrapper: { alignItems: 'center' },
  stepCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  stepCircleActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  stepCircleInactive: { backgroundColor: 'transparent', borderColor: COLORS.whiteAlpha(0.3) },
  stepText: { fontSize: 10, fontWeight: '700', marginTop: 6, textTransform: 'uppercase' },
  stepTextActive: { color: COLORS.accent },
  stepTextInactive: { color: COLORS.whiteAlpha(0.3) },
  stepLine: { flex: 1, height: 2, marginHorizontal: 10 },
  stepLineActive: { backgroundColor: COLORS.accent },
  stepLineInactive: { backgroundColor: COLORS.whiteAlpha(0.2) },

  formCard: { backgroundColor: COLORS.white, borderRadius: 28, padding: 24, ...SHADOWS.heavy },
  stepTitle: { fontSize: 20, fontWeight: '700', color: COLORS.primaryDeep, marginBottom: 20 },
  inputWrapper: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '800', color: COLORS.gray500, marginBottom: 8, letterSpacing: 1 },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.gray50, 
    borderRadius: 14, 
    borderWidth: 1, 
    borderColor: COLORS.gray100, 
    paddingHorizontal: 16, 
    height: 56 
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: COLORS.primaryDeep, fontSize: 15, fontWeight: '500' },
  row: { flexDirection: 'row' },
  
  paymentPicker: { flexDirection: 'row', gap: 8 },
  paymentOption: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.gray200, alignItems: 'center' },
  paymentOptionActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accentSoft },
  paymentText: { fontSize: 12, fontWeight: '700', color: COLORS.gray500, textAlign: 'center' },
  paymentTextActive: { color: COLORS.accentDark },

  mainBtn: { 
    backgroundColor: COLORS.primary, 
    height: 58, 
    borderRadius: 16, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10, 
    gap: 10,
    ...SHADOWS.medium 
  },
  submitBtn: { backgroundColor: COLORS.success },
  mainBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  privacyNote: { fontSize: 11, color: COLORS.gray400, textAlign: 'center', marginTop: 15, lineHeight: 16 },
  
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { color: COLORS.whiteAlpha(0.6), fontSize: 14 },
  loginText: { color: COLORS.accent, fontSize: 14, fontWeight: '700' },
});
