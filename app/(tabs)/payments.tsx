/**
 * ============================================================
 * Écran Paiements - Dream Team Mobile
 * Liste des paiements du membre avec filtre, statuts colorés
 * et lien vers la création de paiement
 * ============================================================
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  CreditCard,
  Plus,
  Banknote,
  Smartphone,
  ChevronRight,
} from 'lucide-react-native';
import { getMemberPayments } from '../../src/api/payments';
import { getMyMemberProfile } from '../../src/api/members';
import { useAuthStore } from '../../src/store/useAuthStore';
import AnimatedCard from '../../src/components/common/AnimatedCard';
import StatusBadge from '../../src/components/common/StatusBadge';
import EmptyState from '../../src/components/common/EmptyState';
import LoadingScreen from '../../src/components/common/LoadingScreen';
import GradientButton from '../../src/components/common/GradientButton';
import { PaymentResponse, PaymentType, PaymentMode } from '../../src/types';
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOWS,
} from '../../src/theme/theme';

/** Labels lisibles pour les types de paiement */
const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  INSCRIPTION: 'Inscription',
  ASSURANCE: 'Fonds de secours',
  SANCTION: 'Sanction',
  TONTINE: 'Tontine',
  EPARGNE: 'Épargne',
  AUTRE: 'Autre',
};

/** Icônes et couleurs par mode de paiement */
const getPaymentModeInfo = (mode: PaymentMode) => {
  switch (mode) {
    case 'ORANGE_MONEY':
      return { label: 'Orange Money', color: COLORS.orangeMoney };
    case 'MTN_MOMO':
      return { label: 'MTN MoMo', color: COLORS.mtnMomoText };
    case 'ESPECE':
      return { label: 'Espèce', color: COLORS.gray600 };
    case 'BANQUE':
      return { label: 'Banque', color: COLORS.info };
    default:
      return { label: 'Autre', color: COLORS.gray500 };
  }
};

export default function PaymentsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Charge les paiements du membre connecté
   */
  const loadPayments = useCallback(async () => {
    let currentMemberId = user?.memberId;

    // Si pas de memberId, on tente de le récupérer
    if (!currentMemberId) {
      try {
        const res = await getMyMemberProfile();
        if (res.success && res.data?.id) {
          currentMemberId = res.data.id;
          updateUser({ memberId: res.data.id, memberMatricule: res.data.matricule });
        } else {
          setLoading(false);
          return;
        }
      } catch (e) {
        console.log('Erreur profil membre:', e);
        setLoading(false);
        return;
      }
    }

    try {
      const response = await getMemberPayments(currentMemberId);
      if (response.success && response.data) {
        setPayments(response.data.content || []);
      }
    } catch (error) {
      console.log('Erreur chargement paiements:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.memberId]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  }, [loadPayments]);

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat('fr-FR').format(amount || 0) + ' FCFA';

  const formatDate = (date: string): string => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) return <LoadingScreen message="Chargement des paiements..." />;

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
        <View style={styles.headerContent}>
          <CreditCard size={28} color={COLORS.white} />
          <Text style={styles.headerTitle}>Mes Paiements</Text>
          <Text style={styles.headerSub}>{payments.length} transaction(s)</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Bouton nouveau paiement */}
        <AnimatedCard index={0} variant="elevated" style={styles.newPaymentCard}>
          <TouchableOpacity
            style={styles.newPaymentRow}
            onPress={() => router.push('/payment/create')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={COLORS.primaryGradient as unknown as [string, string, ...string[]]}
              style={styles.newPaymentIcon}
            >
              <Plus size={24} color={COLORS.white} />
            </LinearGradient>
            <View style={styles.newPaymentTexts}>
              <Text style={styles.newPaymentTitle}>Effectuer un paiement</Text>
              <Text style={styles.newPaymentSub}>
                Inscription, assurance, tontine...
              </Text>
            </View>
            <ChevronRight size={20} color={COLORS.gray400} />
          </TouchableOpacity>
        </AnimatedCard>

        {/* Liste des paiements */}
        {payments.length === 0 ? (
          <EmptyState
            icon={<CreditCard size={40} color={COLORS.gray400} />}
            title="Aucun paiement"
            description="Vos paiements apparaîtront ici une fois effectués."
            actionLabel="Effectuer un paiement"
            onAction={() => router.push('/payment/create')}
          />
        ) : (
          payments.map((payment, index) => {
            const modeInfo = getPaymentModeInfo(payment.modePaiement);

            return (
              <AnimatedCard key={payment.id} index={index + 1} variant="default">
                <View style={styles.paymentHeader}>
                  <View style={styles.paymentTypeRow}>
                    <View
                      style={[
                        styles.paymentTypeIcon,
                        { backgroundColor: COLORS.primarySoft },
                      ]}
                    >
                      <Banknote size={18} color={COLORS.primary} />
                    </View>
                    <View style={styles.paymentTypeTexts}>
                      <Text style={styles.paymentType}>
                        {PAYMENT_TYPE_LABELS[payment.typePaiement] || payment.typePaiement}
                      </Text>
                      <Text style={styles.paymentDate}>
                        {formatDate(payment.paymentDate || payment.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <StatusBadge status={payment.status} size="sm" />
                </View>

                <View style={styles.paymentDetails}>
                  <View style={styles.paymentDetailRow}>
                    <Text style={styles.detailLabel}>Montant</Text>
                    <Text style={styles.detailAmount}>
                      {formatCurrency(payment.montant)}
                    </Text>
                  </View>
                  <View style={styles.paymentDetailRow}>
                    <Text style={styles.detailLabel}>Mode</Text>
                    <View style={styles.modeTag}>
                      {payment.modePaiement === 'ORANGE_MONEY' && (
                        <Image
                          source={require('../../assets/images/Orange_Money-Logo.wine.png')}
                          style={styles.modeLogo}
                          resizeMode="contain"
                        />
                      )}
                      {payment.modePaiement === 'MTN_MOMO' && (
                        <Image
                          source={require('../../assets/images/logo_mtn_money.png')}
                          style={styles.modeLogo}
                          resizeMode="contain"
                        />
                      )}
                      <Text style={[styles.modeText, { color: modeInfo.color }]}>
                        {modeInfo.label}
                      </Text>
                    </View>
                  </View>
                </View>
              </AnimatedCard>
            );
          })
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 55,
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
  scrollView: { flex: 1, marginTop: -SPACING.lg },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  // Nouveau paiement
  newPaymentCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  newPaymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newPaymentIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  newPaymentTexts: { flex: 1 },
  newPaymentTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray800,
  },
  newPaymentSub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    marginTop: 2,
  },
  // Carte paiement
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  paymentTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  paymentTypeTexts: { flex: 1 },
  paymentType: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.gray800,
  },
  paymentDate: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray400,
    marginTop: 2,
  },
  paymentDetails: {
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  paymentDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  detailLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
  },
  detailAmount: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  modeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  modeLogo: {
    width: 22,
    height: 22,
  },
  modeText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },
  bottomSpacer: { height: SPACING.xxl },
});
