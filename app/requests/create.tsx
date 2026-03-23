/**
 * ============================================================
 * Écran Création de Requête - Dream Team Mobile
 * Formulaire de soumission de requête au bureau
 * ============================================================
 */
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react-native';
import { createRequest } from '../../src/api/requests';
import GradientButton from '../../src/components/common/GradientButton';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../../src/theme/theme';

export default function CreateRequestScreen() {
  const router = useRouter();
  const [motif, setMotif] = useState('');
  const [description, setDescription] = useState('');
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /** Validation du formulaire */
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!motif.trim() || motif.trim().length < 5) e.motif = 'Le motif doit contenir au moins 5 caractères';
    if (!description.trim() || description.trim().length < 20) e.description = 'La description doit contenir au moins 20 caractères';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /** Soumission de la requête */
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await createRequest({ motif: motif.trim(), description: description.trim(), solutionSouhaitee: solution.trim() || undefined });
      if (res.success) {
        Alert.alert('✅ Requête soumise !', res.message || 'Votre requête a été envoyée.', [{ text: 'OK', onPress: () => router.back() }]);
      } else {
        Alert.alert('Erreur', res.message || 'Erreur lors de la soumission');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error?.response?.data?.message || 'Impossible de soumettre la requête');
    } finally { setLoading(false); }
  };

  return (
    <View style={st.container}>
      <LinearGradient colors={COLORS.warningGradient as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.header}>
        <View style={st.bgC} />
        <TouchableOpacity style={st.back} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={st.hContent}>
          <MessageSquare size={28} color={COLORS.white} />
          <Text style={st.hTitle}>Nouvelle Requête</Text>
          <Text style={st.hSub}>Soumettez votre demande au bureau</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, marginTop: -SPACING.md }}>
        <ScrollView contentContainerStyle={st.scrollC} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={st.form}>
            {/* Motif */}
            <View style={st.group}>
              <Text style={st.label}>Motif *</Text>
              <TextInput style={[st.input, errors.motif && st.inputErr]} placeholder="Ex: Demande de prêt" placeholderTextColor={COLORS.gray400}
                value={motif} onChangeText={(t) => { setMotif(t); if (errors.motif) setErrors((e) => ({ ...e, motif: '' })); }} />
              {errors.motif ? <Text style={st.err}>{errors.motif}</Text> : null}
            </View>

            {/* Description */}
            <View style={st.group}>
              <Text style={st.label}>Description détaillée *</Text>
              <TextInput style={[st.textarea, errors.description && st.inputErr]} placeholder="Décrivez votre requête en détail (min. 20 caractères)..."
                placeholderTextColor={COLORS.gray400} value={description} onChangeText={(t) => { setDescription(t); if (errors.description) setErrors((e) => ({ ...e, description: '' })); }}
                multiline numberOfLines={5} textAlignVertical="top" />
              <Text style={st.counter}>{description.length}/2000</Text>
              {errors.description ? <Text style={st.err}>{errors.description}</Text> : null}
            </View>

            {/* Solution souhaitée */}
            <View style={st.group}>
              <Text style={st.label}>Solution souhaitée (optionnel)</Text>
              <TextInput style={st.textarea} placeholder="Quelle solution attendez-vous ?" placeholderTextColor={COLORS.gray400}
                value={solution} onChangeText={setSolution} multiline numberOfLines={3} textAlignVertical="top" />
            </View>

            {/* Bouton */}
            <View style={{ marginTop: SPACING.lg }}>
              <GradientButton title="Soumettre la requête" onPress={handleSubmit} loading={loading} size="lg" variant="warning"
                icon={<Send size={20} color={COLORS.white} />} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 50, paddingBottom: SPACING.xxl, paddingHorizontal: SPACING.lg, overflow: 'hidden' },
  bgC: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: COLORS.whiteAlpha(0.08), top: -50, right: -60 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.whiteAlpha(0.2), justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  hContent: { alignItems: 'center' },
  hTitle: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.extrabold, color: COLORS.white, marginTop: SPACING.sm },
  hSub: { fontSize: FONT_SIZE.md, color: COLORS.whiteAlpha(0.8), marginTop: SPACING.xs },
  scrollC: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  form: { backgroundColor: COLORS.white, borderRadius: RADIUS.xxl, padding: SPACING.xl, ...SHADOWS.heavy },
  group: { marginBottom: SPACING.lg },
  label: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: COLORS.gray600, marginBottom: SPACING.sm, letterSpacing: 0.3 },
  input: { backgroundColor: COLORS.gray50, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.gray200, paddingHorizontal: SPACING.md, height: 52, fontSize: FONT_SIZE.md, color: COLORS.gray800 },
  textarea: { backgroundColor: COLORS.gray50, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.gray200, paddingHorizontal: SPACING.md, paddingTop: SPACING.md, minHeight: 120, fontSize: FONT_SIZE.md, color: COLORS.gray800 },
  inputErr: { borderColor: COLORS.danger, backgroundColor: COLORS.dangerLight },
  err: { fontSize: FONT_SIZE.xs, color: COLORS.danger, marginTop: SPACING.xs },
  counter: { fontSize: FONT_SIZE.xs, color: COLORS.gray400, textAlign: 'right', marginTop: SPACING.xs },
});
