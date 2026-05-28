/**
 * ============================================================
 * Écran Tontines - Dream Team Mobile
 * Liste des tontines avec cartes animées et infos détaillées
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Repeat,
  Calendar,
  Users,
  TrendingUp,
  Lock,
  ChevronRight,
  UserPlus,
  CreditCard,
} from 'lucide-react-native';
import { getAvailableTontines, getMySubscriptions } from '../../src/api/tontines';
import AnimatedCard from '../../src/components/common/AnimatedCard';
import StatusBadge from '../../src/components/common/StatusBadge';
import EmptyState from '../../src/components/common/EmptyState';
import LoadingScreen from '../../src/components/common/LoadingScreen';
import { SubscriptionResponse, TontineResponse, TontineFrequency } from '../../src/types';
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOWS,
} from '../../src/theme/theme';
import { showErrorAlert } from '../../src/utils/errorUtils';

export default function TontinesScreen() {
  const router = useRouter();
  const [tontines, setTontines] = useState<TontineResponse[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Charge la liste des tontines actives
   */
  const loadTontines = useCallback(async () => {
    try {
      const [tontinesResponse, subscriptionsResponse] = await Promise.all([
        getAvailableTontines(),
        getMySubscriptions(),
      ]);
      if (tontinesResponse.success && tontinesResponse.data) {
        setTontines(tontinesResponse.data.content || []);
      }
      if (subscriptionsResponse.success && subscriptionsResponse.data) {
        setSubscriptions(subscriptionsResponse.data.filter((sub) => sub.isActive));
      }
    } catch (error) {
      showErrorAlert(error, 'Mes Tontines');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTontines();
  }, [loadTontines]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTontines();
    setRefreshing(false);
  }, [loadTontines]);

  /**
   * Formatte un montant en FCFA
   */
  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat('fr-FR').format(amount || 0) + ' FCFA';

  /**
   * Traduit la fréquence de la tontine
   */
  const getFrequencyLabel = (freq: TontineFrequency): string => {
    const map: Record<TontineFrequency, string> = {
      HEBDOMADAIRE: 'Hebdomadaire',
      'BI-HEBDOMADAIRE': 'Bi-hebdomadaire',
      MENSUELLE: 'Mensuelle',
      BIMENSUELLE: 'Bimensuelle',
      TRIMESTRIELLE: 'Trimestrielle',
      SEMESTRIELLE: 'Semestrielle',
      ANNUELLE: 'Annuelle',
    };
    return map[freq] || freq;
  };

  const getActiveSubscription = (tontineId: string) =>
    subscriptions.find((sub) => sub.tontineId === tontineId && sub.isActive);

  const goToContributionPayment = (
    tontine: TontineResponse,
    subscription: SubscriptionResponse
  ) => {
    const amount = (tontine.montantCotisation || 0) * Number(subscription.multiplier || 1);
    router.push({
      pathname: '/payment/create',
      params: {
        type: 'TONTINE',
        amount: String(amount),
        relatedEntityId: subscription.id,
        label: `${tontine.denomination} - ${subscription.subscriptionName}`,
      },
    } as any);
  };

  if (loading) return <LoadingScreen message="Chargement des tontines..." />;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={COLORS.successGradient as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={[styles.bgCircle, styles.bgCircle1]} />
        <View style={styles.headerContent}>
          <Repeat size={28} color={COLORS.white} />
          <Text style={styles.headerTitle}>Tontines disponibles</Text>
          <Text style={styles.headerSub}>
            {tontines.length} tontine{tontines.length > 1 ? 's' : ''} ouverte{tontines.length > 1 ? 's' : ''}
          </Text>
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
            colors={[COLORS.success]}
          />
        }
      >
        {tontines.length === 0 ? (
          <EmptyState
            icon={<Repeat size={40} color={COLORS.gray400} />}
            title="Aucune tontine disponible"
            description="Les tontines ouvertes à l'adhésion apparaîtront ici."
          />
        ) : (
          tontines.map((tontine, index) => {
            const activeSubscription = getActiveSubscription(tontine.id);

            return (
            <AnimatedCard key={tontine.id} index={index} variant="elevated">
              <TouchableOpacity
                onPress={() => router.push(`/tontine/${tontine.id}`)}
                activeOpacity={0.7}
              >
                {/* En-tête de la carte */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <View style={styles.tontineIcon}>
                      <Repeat size={18} color={COLORS.success} />
                    </View>
                    <View style={styles.cardTitleTexts}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {tontine.denomination}
                      </Text>
                      <Text style={styles.cardSubtitle}>
                        {getFrequencyLabel(tontine.periodicite)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    {tontine.isLocked && (
                      <Lock size={16} color={COLORS.warning} style={{ marginRight: 8 }} />
                    )}
                    <ChevronRight size={20} color={COLORS.gray400} />
                  </View>
                </View>

                {/* Infos détaillées */}
                <View style={styles.cardInfoGrid}>
                  <View style={styles.infoItem}>
                    <Calendar size={14} color={COLORS.gray400} />
                    <Text style={styles.infoText}>
                      Période {tontine.currentPeriod}/{tontine.totalPeriods}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Users size={14} color={COLORS.gray400} />
                    <Text style={styles.infoText}>
                      {tontine.totalSubscriptions} membre{tontine.totalSubscriptions > 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>

                {/* Montant de cotisation */}
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Cotisation</Text>
                  <Text style={styles.amountValue}>
                    {formatCurrency(tontine.montantCotisation)}
                  </Text>
                </View>

                {/* Barre de collecte */}
                <View style={styles.collectBar}>
                  <View style={styles.collectBarBg}>
                    <View
                      style={[
                        styles.collectBarFill,
                        {
                          width: `${
                            tontine.totalCotisationsExpected > 0
                              ? Math.min(
                                  (tontine.totalCotisationsReceived /
                                    tontine.totalCotisationsExpected) *
                                    100,
                                  100
                                )
                              : 0
                          }%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.collectText}>
                    {formatCurrency(tontine.totalCotisationsReceived)} /{' '}
                    {formatCurrency(tontine.totalCotisationsExpected)}
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={styles.cardButtons}>
                <TouchableOpacity
                  style={activeSubscription ? styles.payButton : styles.joinButton}
                  onPress={() =>
                    activeSubscription
                      ? goToContributionPayment(tontine, activeSubscription)
                      : router.push({
                          pathname: '/tontine/[id]',
                          params: { id: tontine.id, join: '1' },
                        } as any)
                  }
                  activeOpacity={0.85}
                >
                  {activeSubscription ? (
                    <CreditCard size={16} color={COLORS.white} />
                  ) : (
                    <UserPlus size={16} color={COLORS.white} />
                  )}
                  <Text style={styles.joinButtonText}>
                    {activeSubscription ? 'Payer' : 'Adhérer'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => router.push(`/tontine/${tontine.id}`)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.detailsButtonText}>Détails</Text>
                  <ChevronRight size={16} color={COLORS.success} />
                </TouchableOpacity>
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
  // Header
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
  headerContent: {
    alignItems: 'center',
  },
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
  // Scroll
  scrollView: { flex: 1, marginTop: -SPACING.lg },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm },
  // Cards
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tontineIcon: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardTitleTexts: { flex: 1 },
  cardTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray800,
  },
  cardSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfoGrid: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    gap: SPACING.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  infoText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  amountLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
  },
  amountValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.success,
  },
  collectBar: { marginTop: SPACING.xs },
  collectBarBg: {
    height: 6,
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  collectBarFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.full,
  },
  collectText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray400,
    marginTop: SPACING.xs,
    textAlign: 'right',
  },
  cardButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  joinButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  payButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  joinButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  detailsButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.successLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  detailsButtonText: {
    color: COLORS.success,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  bottomSpacer: { height: SPACING.xxl },
});
