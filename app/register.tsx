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
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../src/theme/theme';
import { register } from '../src/api/auth';
import { useAuthStore } from '../src/store/useAuthStore';

const { height } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.login);
  
  const [form, setForm] = useState({
    nom: '',
    prenoms: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!form.nom || !form.email || !form.password) {
      Alert.alert('Champs requis', 'Veuillez remplir le nom, l\'email et le mot de passe.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Erreur', 'Les mot de passes diffèrent.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await register({
        nom: form.nom,
        prenoms: form.prenoms,
        email: form.email,
        telephone: form.telephone,
        password: form.password,
      });
      
      if (res.success && res.data) {
        // Correction ici : On passe l'objet de réponse complet ou les 3 arguments
        setAuth(res.data); 
        Alert.alert('Succès', 'Compte créé !', [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]);
      } else {
        Alert.alert('Erreur', res.message || 'Échec inscription');
      }
    } catch (e) {
      Alert.alert('Erreur', 'Connexion impossible');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={[COLORS.primaryDeep, COLORS.primary]} style={StyleSheet.absoluteFill} />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
            <Text style={styles.title}>Rejoignez-nous</Text>
            <Text style={styles.subtitle}>Créez votre compte Dream Team</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400)} style={styles.formContainer}>
            <View style={styles.row}>
              <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>NOM</Text>
                <TextInput style={styles.input} placeholder="Nom" value={form.nom} onChangeText={(v) => setForm({...form, nom: v})} />
              </View>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <Text style={styles.label}>PRÉNOMS</Text>
                <TextInput style={styles.input} placeholder="Prénoms" value={form.prenoms} onChangeText={(v) => setForm({...form, prenoms: v})} />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput style={styles.input} placeholder="votre@email.com" value={form.email} onChangeText={(v) => setForm({...form, email: v})} autoCapitalize="none" />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>TÉLÉPHONE</Text>
              <TextInput style={styles.input} placeholder="6XXXXXXXX" value={form.telephone} onChangeText={(v) => setForm({...form, telephone: v})} keyboardType="phone-pad" />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>MOT DE PASSE</Text>
              <View style={styles.pwRow}>
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="••••••••" value={form.password} onChangeText={(v) => setForm({...form, password: v})} secureTextEntry={!showPassword} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={COLORS.gray400} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>CONFIRMATION</Text>
              <TextInput style={styles.input} placeholder="••••••••" value={form.confirmPassword} onChangeText={(v) => setForm({...form, confirmPassword: v})} secureTextEntry={!showPassword} />
            </View>

            <TouchableOpacity style={[styles.btn, isLoading && { opacity: 0.7 }]} onPress={handleRegister} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>S'inscrire</Text>}
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 60 },
  backBtn: { marginBottom: 20 },
  header: { marginBottom: 30 },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.white },
  subtitle: { fontSize: 14, color: COLORS.accent, fontWeight: '600' },
  formContainer: { backgroundColor: COLORS.white, borderRadius: 24, padding: 24, ...SHADOWS.heavy },
  row: { flexDirection: 'row', marginBottom: 16 },
  inputWrapper: { marginBottom: 16 },
  label: { fontSize: 10, fontWeight: '800', color: COLORS.gray500, marginBottom: 8 },
  input: { backgroundColor: COLORS.gray50, borderRadius: 12, borderWidth: 1, borderColor: COLORS.gray100, paddingHorizontal: 15, height: 50, color: COLORS.primaryDeep },
  pwRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gray50, borderRadius: 12, borderWidth: 1, borderColor: COLORS.gray100, paddingRight: 15 },
  btn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10, ...SHADOWS.heavy },
  btnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
