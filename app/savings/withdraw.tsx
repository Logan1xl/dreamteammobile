import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ArrowUpRight, Wallet } from 'lucide-react-native';
import GradientButton from '../../src/components/common/GradientButton';
import { createRequest } from '../../src/api/requests';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOWS, SPACING } from '../../src/theme/theme';
import { showErrorAlert } from '../../src/utils/errorUtils';

export default function WithdrawSavingsScreen() {
  const router = useRouter();
  const { accountId, accountName, balance } = useLocalSearchParams<{
    accountId: string;
    accountName?: string;
    balance?: string;
  }>();

  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const currentBalance = Number(balance || 0);
  const requestedAmount = Number(amount.replace(',', '.'));

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR').format(value || 0) + ' FCFA';

  const handleSubmit = async () => {
    if (!accountId) {
      Alert.alert('Compte introuvable', 'Impossible de créer la demande sans compte épargne.');
      return;
    }
    if (!requestedAmount || requestedAmount <= 0) {
      Alert.alert('Montant invalide', 'Veuillez saisir un montant positif.');
      return;
    }
    if (requestedAmount > currentBalance) {
      Alert.alert('Solde insuffisant', 'Le montant demandé dépasse le solde disponible.');
      return;
    }
    if (reason.trim().length < 10) {
      Alert.alert('Motif requis', 'Veuillez préciser le motif du retrait en au moins 10 caractères.');
      return;
    }

    setLoading(true);
    try {
      const res = await createRequest({
        motif: 'Demande de retrait épargne',
        description: `Demande de retrait de ${formatCurrency(requestedAmount)} sur le compte ${accountName || accountId}. Motif: ${reason.trim()}`,
        solutionSouhaitee: 'Validation et exécution du retrait par le bureau.',
        requestType: 'WITHDRAWAL_SAVINGS',
        relatedEntityId: accountId,
        amount: requestedAmount,
      });

      if (res.success) {
        Alert.alert(
          'Demande envoyée',
          'Votre demande de retrait a été transmise au bureau pour validation.',
          [{ text: 'OK', onPress: () => router.replace('/requests' as any) }]
        );
      }
    } catch (error) {
      showErrorAlert(error, 'Retrait épargne');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.dangerGradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <ArrowUpRight size={30} color={COLORS.white} />
          <Text style={styles.headerTitle}>Demande de retrait</Text>
          <Text style={styles.headerSub}>{accountName || 'Compte épargne'}</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.balanceBox}>
              <Wallet size={22} color={COLORS.danger} />
              <View>
                <Text style={styles.balanceLabel}>Solde disponible</Text>
                <Text style={styles.balanceValue}>{formatCurrency(currentBalance)}</Text>
              </View>
            </View>

            <View style={styles.group}>
              <Text style={styles.label}>Montant à retirer</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={COLORS.gray400}
              />
            </View>

            <View style={styles.group}>
              <Text style={styles.label}>Motif du retrait</Text>
              <TextInput
                style={styles.textarea}
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholder="Expliquez brièvement pourquoi vous souhaitez retirer..."
                placeholderTextColor={COLORS.gray400}
              />
            </View>

            <GradientButton
              title="Envoyer la demande"
              onPress={handleSubmit}
              loading={loading}
              variant="danger"
              size="lg"
              icon={<ArrowUpRight size={20} color={COLORS.white} />}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 54, paddingBottom: SPACING.xxl, paddingHorizontal: SPACING.lg },
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
  headerTitle: { fontSize: FONT_SIZE.xxl, color: COLORS.white, fontWeight: FONT_WEIGHT.extrabold, marginTop: SPACING.sm },
  headerSub: { fontSize: FONT_SIZE.md, color: COLORS.whiteAlpha(0.82), marginTop: SPACING.xs },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl, marginTop: -SPACING.lg },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.xxl, padding: SPACING.xl, ...SHADOWS.heavy },
  balanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.dangerLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  balanceLabel: { fontSize: FONT_SIZE.xs, color: COLORS.gray500, fontWeight: FONT_WEIGHT.bold },
  balanceValue: { fontSize: FONT_SIZE.lg, color: COLORS.danger, fontWeight: FONT_WEIGHT.extrabold, marginTop: 2 },
  group: { marginBottom: SPACING.lg },
  label: { fontSize: FONT_SIZE.sm, color: COLORS.gray600, fontWeight: FONT_WEIGHT.bold, marginBottom: SPACING.sm },
  input: {
    height: 54,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.gray50,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray800,
  },
  textarea: {
    minHeight: 120,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.gray50,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.gray800,
  },
});
