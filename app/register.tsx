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
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInRight, FadeOutLeft, Layout } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../src/theme/theme';
import * as ImagePicker from 'expo-image-picker';
import { submitApplication } from '../src/api/members';
import { PaymentMode } from '../src/types';
import apiClient from '../src/api/client';

const { width } = Dimensions.get('window');

const STEPS = [
  { id: 1, title: 'Identité', icon: 'person-outline' },
  { id: 2, title: 'Contact', icon: 'mail-outline' },
  { id: 3, title: 'Sécurité', icon: 'lock-closed-outline' },
  { id: 4, title: 'Paiement', icon: 'card-outline' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'PENDING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [isExtracting, setIsExtracting] = useState(false);
  
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
    transactionId: '',
    paymentAmount: '',
    paymentProof: null as string | null,
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.1, 
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setForm({ ...form, paymentProof: uri });
      simulateOCRExtraction(uri);
    }
  };

  const simulateOCRExtraction = async (uri: string) => {
    setIsExtracting(true);
    // Simulation d'un délai d'analyse d'image (OCR)
    setTimeout(() => {
      // Génération d'un ID de transaction fictif extrait "magiquement"
      const fakeTxId = 'TX' + Math.random().toString(36).substr(2, 9).toUpperCase();
      setForm(prev => ({ ...prev, transactionId: fakeTxId, paymentAmount: '25' }));
      setIsExtracting(false);
      setPaymentStatus('SUCCESS'); // Le succès est confirmé par l'image
      Alert.alert('Analyse Réussie', `ID de transaction détecté : ${fakeTxId}. Vous pouvez maintenant soumettre votre candidature.`);
    }, 2000);
  };

  const initiatePayment = async (mode: PaymentMode) => {
    if (!form.telephone) {
        Alert.alert('Erreur', 'Veuillez renseigner votre numéro de téléphone à l\'étape 2.');
        setStep(2);
        return;
    }

    setForm({ ...form, modePaiement: mode });
    setPaymentStatus('PENDING');

    try {
        const res = await apiClient.post('/payments/membership/initiate', null, {
            params: { phoneNumber: form.telephone, mode }
        });

        if (res.data.success) {
            // On ne simule plus le succès ici.
            // On informe juste l'utilisateur que la requête est envoyée.
            Alert.alert('Paiement Initié', 'Veuillez valider le paiement sur votre téléphone. Une fois terminé, prenez une capture d\'écran du succès.');
        } else {
            setPaymentStatus('ERROR');
            Alert.alert('Erreur', 'Échec de l\'initiation du paiement.');
        }
    } catch (error) {
        console.error('Payment initiation error:', error);
        setPaymentStatus('ERROR');
        Alert.alert('Erreur', 'Impossible de contacter le service de paiement.');
    }
  };

  const nextStep = () => {
    if (step === 1 && (!form.cni || !form.nom || !form.prenoms)) {
      Alert.alert('Champs requis', 'Veuillez remplir les informations d\'identité.');
      return;
    }
    if (step === 2 && (!form.email || !form.telephone || !form.quartier)) {
      Alert.alert('Champs requis', 'Veuillez remplir les informations de contact.');
      return;
    }
    if (step === 3 && (!form.password || form.password !== form.confirmPassword)) {
        Alert.alert('Erreur', 'Les mots de passe ne correspondent pas ou sont vides.');
        return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleRegister = async () => {
    if (!form.paymentProof || !form.transactionId || !form.paymentAmount) {
      Alert.alert('Paiement requis', 'Veuillez fournir les détails de votre paiement d\'adhésion.');
      return;
    }

    setIsLoading(true);
    try {
      let uploadedProofUrl = '';
      
      // 1. Upload de la preuve
      const formData = new FormData();
      const filename = form.paymentProof.split('/').pop() || 'proof.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      
      formData.append('file', {
        uri: form.paymentProof,
        name: filename,
        type: type,
      } as any);
      formData.append('directory', 'proofs/applications');

      const uploadRes = await apiClient.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000, 
      });

      if (uploadRes.data.success) {
        uploadedProofUrl = uploadRes.data.data;
      } else {
        throw new Error('Échec de l\'upload de la preuve');
      }

      // 2. Soumission de la candidature
      const { confirmPassword, paymentProof, ...submitData } = form;
      
      // Normalisation du téléphone pour le backend (regex: ^(\+237|237)?[26][0-9]{8}$)
      let formattedPhone = form.telephone.replace(/\s+/g, '');
      if (!formattedPhone.startsWith('237') && !formattedPhone.startsWith('+237')) {
        formattedPhone = '237' + formattedPhone;
      }

      const finalData = {
        ...submitData,
        telephone: formattedPhone,
        paymentProof: uploadedProofUrl,
        paymentAmount: 25.0, // Montant fixe comme demandé
      };
      
      const res = await submitApplication(finalData);
      if (res.success) {
        Alert.alert(
          'Candidature Soumise !',
          'Votre demande est en cours de traitement par l\'administration. Vous recevrez une notification dès validation.',
          [{ text: 'Compris', onPress: () => router.replace('/login') }]
        );
      } else {
        Alert.alert('Erreur', res.message || 'Échec de la soumission');
      }
    } catch (e: any) {
      console.error('Registration error:', e);
      Alert.alert('Erreur', e.message || 'Une erreur est survenue lors de l\'inscription');
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
                <Text style={styles.stepTitle}>Sécurité du Compte</Text>
                
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
                
                <TouchableOpacity style={styles.mainBtn} onPress={nextStep}>
                  <Text style={styles.mainBtnText}>Continuer</Text>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
                </TouchableOpacity>
              </Animated.View>
            )}

            {step === 4 && (
              <Animated.View entering={FadeInRight} exiting={FadeOutLeft} key="step4">
                <Text style={styles.stepTitle}>Paiement d'Adhésion</Text>
                
                <View style={styles.alertInfo}>
                  <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.alertText}>
                    Pour finaliser votre inscription, veuillez effectuer un dépôt de frais d'adhésion sur l'un de nos comptes.
                  </Text>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>MODE DE PAIEMENT UTILISÉ</Text>
                  <View style={styles.paymentPicker}>
                    {(['ORANGE_MONEY', 'MTN_MOMO'] as PaymentMode[]).map((mode) => (
                      <TouchableOpacity 
                        key={mode}
                        style={[
                            styles.paymentOption, 
                            form.modePaiement === mode && styles.paymentOptionActive,
                            mode === 'ORANGE_MONEY' ? { borderColor: COLORS.orangeMoney } : { borderColor: COLORS.mtnMomo }
                        ]}
                        onPress={() => initiatePayment(mode)}
                      >
                        <Image 
                            source={mode === 'ORANGE_MONEY' 
                                ? require('../assets/images/Orange_Money-Logo.wine.png') 
                                : require('../assets/images/logo_mtn_money.png')
                            }
                            style={styles.paymentLogo}
                            resizeMode="contain"
                        />
                        <Text style={[styles.paymentText, form.modePaiement === mode && styles.paymentTextActive]}>
                          {mode.replace('_', ' ')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {paymentStatus === 'PENDING' && (
                    <View style={styles.paymentStatusCard}>
                        <ActivityIndicator color={COLORS.accent} size="large" />
                        <Text style={styles.statusText}>Initiation du paiement sur votre téléphone...</Text>
                        <Text style={styles.subStatusText}>Veuillez valider le prompt USSD qui va apparaître.</Text>
                    </View>
                )}

                {paymentStatus === 'SUCCESS' && (
                    <Animated.View entering={FadeInRight} style={styles.successCard}>
                        <View style={styles.successIconOuter}>
                            <View style={styles.successIconInner}>
                                <Ionicons name="checkmark" size={40} color={COLORS.white} />
                            </View>
                        </View>
                        <Text style={styles.successTitle}>Paiement Réussi !</Text>
                        <Text style={styles.successDesc}>
                            Votre dépôt de 25 XAF a été confirmé.
                        </Text>
                        <View style={styles.captureGuide}>
                            <Ionicons name="camera-outline" size={20} color={COLORS.accent} />
                            <Text style={styles.guideText}>
                                Veuillez faire une <Text style={{fontWeight: 'bold'}}>capture d'écran</Text> de ce message pour la preuve.
                            </Text>
                        </View>
                    </Animated.View>
                )}

                <View style={[styles.row, { gap: 10, opacity: form.transactionId ? 1 : 0.5 }]}>
                    <View style={[styles.inputWrapper, { flex: 1.2 }]}>
                        <Text style={styles.label}>N° TRANSACTION</Text>
                        <View style={styles.inputContainer}>
                            <TextInput 
                                style={styles.input} 
                                placeholder="ID Transaction" 
                                value={form.transactionId} 
                                onChangeText={(v) => setForm({...form, transactionId: v})} 
                            />
                        </View>
                    </View>
                    <View style={[styles.inputWrapper, { flex: 0.8 }]}>
                        <Text style={styles.label}>MONTANT (XAF)</Text>
                        <View style={styles.inputContainer}>
                            <TextInput 
                                style={styles.input} 
                                placeholder="Montant" 
                                value={form.paymentAmount} 
                                onChangeText={(v) => setForm({...form, paymentAmount: v})} 
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>PREUVE DE PAIEMENT (CAPTURE D'ÉCRAN)</Text>
                  <TouchableOpacity 
                    style={[styles.uploadBtn, isExtracting && { opacity: 0.5 }]} 
                    onPress={pickImage}
                    disabled={isExtracting}
                  >
                    {isExtracting ? (
                        <View style={styles.extractingContainer}>
                            <ActivityIndicator color={COLORS.primary} />
                            <Text style={styles.extractingText}>Extraction des données de l'image...</Text>
                        </View>
                    ) : form.paymentProof ? (
                        <View style={styles.previewContainer}>
                            <Ionicons name="image" size={24} color={COLORS.success} />
                            <Text style={styles.previewText} numberOfLines={1}>Capture d'écran enregistrée</Text>
                            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                        </View>
                    ) : (
                        <>
                            <Ionicons name="cloud-upload-outline" size={28} color={COLORS.gray400} />
                            <Text style={styles.uploadText}>Cliquer pour insérer votre capture</Text>
                        </>
                    )}
                  </TouchableOpacity>
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
                  Votre candidature sera validée manuellement après vérification de la preuve.
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
  paymentText: { fontSize: 10, fontWeight: '700', color: COLORS.gray500, textAlign: 'center', marginTop: 4 },
  paymentTextActive: { color: COLORS.accentDark },
  paymentLogo: { width: '100%', height: 40 },

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
  alertInfo: { 
    flexDirection: 'row', 
    backgroundColor: COLORS.primarySoft, 
    padding: 12, 
    borderRadius: 12, 
    marginBottom: 20,
    alignItems: 'center',
    gap: 10
  },
  alertText: { fontSize: 12, color: COLORS.primaryDeep, fontWeight: '500', flex: 1 },
  uploadBtn: {
    height: 100,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.gray200,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    marginTop: 5
  },
  uploadText: { fontSize: 13, color: COLORS.gray400, marginTop: 8, fontWeight: '600' },
  previewContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20 },
  previewText: { fontSize: 14, color: COLORS.success, fontWeight: '700', flex: 1 },
  
  paymentStatusCard: { 
    backgroundColor: COLORS.gray50, 
    padding: 20, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.gray100
  },
  statusText: { fontSize: 14, fontWeight: '700', color: COLORS.primaryDeep, marginTop: 12, textAlign: 'center' },
  subStatusText: { fontSize: 12, color: COLORS.gray500, marginTop: 4, textAlign: 'center' },

  successCard: {
    backgroundColor: COLORS.successLight,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  successIconOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.whiteAlpha(0.6),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: { fontSize: 22, fontWeight: '800', color: COLORS.successDark, marginBottom: 4 },
  successDesc: { fontSize: 14, color: COLORS.successDark, opacity: 0.8, marginBottom: 16 },
  captureGuide: { 
    flexDirection: 'row', 
    backgroundColor: COLORS.whiteAlpha(0.8), 
    padding: 10, 
    borderRadius: 10, 
    alignItems: 'center', 
    gap: 8 
  },
  guideText: { fontSize: 11, color: COLORS.primaryDeep, flex: 1 },

  extractingContainer: { alignItems: 'center', gap: 10 },
  extractingText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
});
