/**
 * ============================================================
 * Écran Épargne - Dream Team Mobile
 * Résumé des comptes d'épargne du membre avec soldes et liste
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
import {
  PiggyBank,
  TrendingUp,
  Wallet,
  Lock,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Download
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { getMemberSavings, getMemberSavingsSummary } from '../../src/api/savings';
import { getMyMemberProfile } from '../../src/api/members';
import { useAuthStore } from '../../src/store/useAuthStore';
import AnimatedCard from '../../src/components/common/AnimatedCard';
import EmptyState from '../../src/components/common/EmptyState';
import LoadingScreen from '../../src/components/common/LoadingScreen';
import { SavingsResponse, SavingsSummaryResponse, SavingsType } from '../../src/types';
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
} from '../../src/theme/theme';

export default function SavingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [savings, setSavings] = useState<SavingsResponse[]>([]);
  const [summary, setSummary] = useState<SavingsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Charge les comptes d'épargne et le résumé
   */
  const loadSavings = useCallback(async () => {
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

    // Sécurité supplémentaire : si après tout on n'a toujours pas d'ID, on arrête
    if (!currentMemberId) {
      setLoading(false);
      return;
    }

    try {
      const [savingsRes, summaryRes] = await Promise.all([
        getMemberSavings(currentMemberId as string),
        getMemberSavingsSummary(currentMemberId as string),
      ]);
      if (savingsRes.success) setSavings(savingsRes.data || []);
      if (summaryRes.success) setSummary(summaryRes.data);
    } catch (error) {
      console.log('Erreur chargement épargne:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.memberId]);

  useEffect(() => {
    loadSavings();
  }, [loadSavings]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSavings();
    setRefreshing(false);
  }, [loadSavings]);

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat('fr-FR').format(amount || 0) + ' FCFA';

  if (loading) return <LoadingScreen message="Chargement de l'épargne..." />;

  return (
    <View style={styles.container}>
      {/* Header avec solde total */}
      <LinearGradient
        colors={COLORS.successGradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={[styles.bgCircle, styles.bgCircle1]} />
        <View style={[styles.bgCircle, styles.bgCircle2]} />

        <View style={styles.headerContent}>
          <View style={styles.headerIconCircle}>
            <PiggyBank size={28} color={COLORS.white} />
          </View>
          <Text style={styles.headerLabel}>Solde Total Épargne</Text>
          <Text style={styles.headerAmount}>
            {formatCurrency(summary?.totalBalance || 0)}
          </Text>
          <View style={styles.headerStats}>
            <View style={styles.headerStatItem}>
              <Wallet size={16} color={COLORS.whiteAlpha(0.8)} />
              <Text style={styles.headerStatText}>
                {summary?.activeAccounts || 0} compte{(summary?.activeAccounts || 0) > 1 ? 's' : ''} actif{(summary?.activeAccounts || 0) > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
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
        {savings.length === 0 ? (
          <EmptyState
            icon={<PiggyBank size={40} color={COLORS.gray400} />}
            title="Aucun compte d'épargne"
            description="Vos comptes d'épargne apparaîtront ici. Contactez l'administrateur pour en ouvrir un."
          />
        ) : (
          savings.map((account, index) => (
            <AnimatedCard key={account.id} index={index} variant="elevated">
              <View style={styles.accountHeader}>
                <View style={styles.accountTitleRow}>
                  <View
                    style={[
                      styles.accountIcon,
                      { backgroundColor: COLORS.primarySoft },
                    ]}
                  >
                    {account.typeEpargne === SavingsType.SCOLAIRE && <TrendingUp size={18} color={COLORS.primary} />}
                    {account.typeEpargne === SavingsType.PROJET && <PiggyBank size={18} color={COLORS.primary} />}
                    {account.typeEpargne === SavingsType.ANNUELLE && <Wallet size={18} color={COLORS.primary} />}
                    {account.typeEpargne === SavingsType.AUTRE && <Lock size={18} color={COLORS.primary} />}
                  </View>
                  <View style={styles.accountTexts}>
                    <Text style={styles.accountName} numberOfLines={1}>
                      {account.denomination}
                    </Text>
                    <Text style={styles.accountType}>
                      {account.typeEpargne}
                    </Text>
                  </View>
                </View>

                {!account.isActive && (
                  <View style={styles.closedBadge}>
                    <Text style={styles.closedText}>Clôturé</Text>
                  </View>
                )}
              </View>

              {/* Solde */}
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Solde actuel</Text>
                <Text style={styles.balanceValue}>
                  {formatCurrency(account.balance)}
                </Text>
              </View>

              {/* Jauge de progression visuelle */}
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>OBJECTIF VISÉ</Text>
                  <Text style={styles.progressPercent}>75%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: '75%', backgroundColor: COLORS.success }]} />
                </View>
              </View>

              {/* Actions Rapides */}
              <View style={styles.accountActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: COLORS.successLight }]}
                  onPress={() => router.push('/payment/create')}
                >
                  <ArrowDownLeft size={16} color={COLORS.success} />
                  <Text style={[styles.actionButtonText, { color: COLORS.success }]}>Déposer</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: COLORS.dangerLight }]}
                  onPress={() => router.push({ pathname: '/requests', params: { type: 'RETRAIT_EPARGNE', accountId: account.id } })}
                >
                  <ArrowUpRight size={16} color={COLORS.danger} />
                  <Text style={[styles.actionButtonText, { color: COLORS.danger }]}>Retirer</Text>
                </TouchableOpacity>
              </View>
            </AnimatedCard>
          ))
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
    paddingBottom: SPACING.xxl + SPACING.md,
    paddingHorizontal: SPACING.lg,
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: COLORS.whiteAlpha(0.08),
  },
  bgCircle1: { width: 230, height: 230, top: -60, right: -70 },
  bgCircle2: { width: 130, height: 130, bottom: -20, left: -40 },
  headerContent: { alignItems: 'center' },
  headerIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.whiteAlpha(0.2),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.whiteAlpha(0.8),
    fontWeight: FONT_WEIGHT.medium,
  },
  headerAmount: {
    fontSize: FONT_SIZE.hero,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.white,
    marginTop: SPACING.xs,
    letterSpacing: 1,
  },
  headerStats: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.lg,
  },
  headerStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.whiteAlpha(0.12),
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
  },
  headerStatText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.whiteAlpha(0.9),
    fontWeight: FONT_WEIGHT.medium,
  },
  scrollView: { flex: 1, marginTop: -SPACING.lg },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  // Carte compte
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  accountTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  accountTexts: { flex: 1 },
  accountName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray800,
  },
  accountType: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    marginTop: 2,
  },
  closedBadge: {
    backgroundColor: COLORS.gray200,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  closedText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray600,
    fontWeight: FONT_WEIGHT.semibold,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  balanceLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
  },
  balanceValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.primaryDeep,
  },
  progressContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.gray500,
    letterSpacing: 0.5,
  },
  progressPercent: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: COLORS.gray100,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  accountActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray50,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomSpacer: { height: SPACING.xxl },
});
