/**
 * ============================================================
 * Détail d'une Tontine - Dream Team Mobile
 * Affiche toutes les informations d'une tontine avec
 * progression, souscriptions, et infos financières
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
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Repeat,
  Calendar,
  Users,
  Clock,
  Lock,
  TrendingUp,
  Banknote,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react-native';
import { getTontineById } from '../../src/api/tontines';
import AnimatedCard from '../../src/components/common/AnimatedCard';
import LoadingScreen from '../../src/components/common/LoadingScreen';
import { TontineResponse, TontineFrequency } from '../../src/types';
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOWS,
} from '../../src/theme/theme';

export default function TontineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [tontine, setTontine] = useState<TontineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animation de la barre de collecte
  const collectProgress = useSharedValue(0);

  /**
   * Charge les détails de la tontine
   */
  const loadTontine = useCallback(async () => {
    if (!id) return;
    try {
      const response = await getTontineById(id);
      if (response.success && response.data) {
        setTontine(response.data);
        // Animer la progression
        const progress =
          response.data.totalCotisationsExpected > 0
            ? Math.min(
                (response.data.totalCotisationsReceived /
                  response.data.totalCotisationsExpected) *
                  100,
                100
              )
            : 0;
        collectProgress.value = withDelay(
          500,
          withSpring(progress, { damping: 20, stiffness: 80 })
        );
      }
    } catch (error) {
      console.log('Erreur détail tontine:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTontine();
  }, [loadTontine]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTontine();
    setRefreshing(false);
  }, [loadTontine]);

  const collectAnimStyle = useAnimatedStyle(() => ({
    width: `${collectProgress.value}%`,
  }));

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat('fr-FR').format(amount || 0) + ' FCFA';

  const formatDate = (date: string): string => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getFrequencyLabel = (freq: TontineFrequency): string => {
    const map: Record<string, string> = {
      HEBDOMADAIRE: 'Hebdomadaire',
      MENSUELLE: 'Mensuelle',
      TRIMESTRIELLE: 'Trimestrielle',
    };
    return map[freq] || freq;
  };

  if (loading) return <LoadingScreen message="Chargement des détails..." />;
  if (!tontine) return null;

  // Calcul du pourcentage de collecte
  const collectPercent =
    tontine.totalCotisationsExpected > 0
      ? Math.round(
          (tontine.totalCotisationsReceived / tontine.totalCotisationsExpected) * 100
        )
      : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={COLORS.primaryGradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={[styles.bgCircle, styles.bgCircle1]} />

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Repeat size={28} color={COLORS.white} />
          </View>
          <Text style={styles.headerTitle} numberOfLines={2}>
            {tontine.denomination}
          </Text>
          <View style={styles.headerBadges}>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>
                {getFrequencyLabel(tontine.periodicite)}
              </Text>
            </View>
            {tontine.isLocked && (
              <View style={[styles.headerBadge, { backgroundColor: COLORS.accentAlpha(0.25) }]}>
                <Lock size={12} color={COLORS.accent} />
                <Text style={[styles.headerBadgeText, { color: COLORS.accent }]}> Verrouillée</Text>
              </View>
            )}
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
        {/* Carte Collecte */}
        <AnimatedCard index={0} variant="elevated" style={styles.collectCard}>
          <View style={styles.collectHeader}>
            <Text style={styles.collectTitle}>Collecte des cotisations</Text>
            <Text style={styles.collectPercent}>{collectPercent}%</Text>
          </View>

          <View style={styles.collectBarContainer}>
            <View style={styles.collectBarBg}>
              <Animated.View style={[styles.collectBarFill, collectAnimStyle]}>
                <LinearGradient
                  colors={COLORS.successGradient as unknown as [string, string, ...string[]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.collectGradient}
                />
              </Animated.View>
            </View>
          </View>

          <View style={styles.collectAmounts}>
            <View>
              <Text style={styles.collectLabel}>Reçu</Text>
              <Text style={styles.collectValue}>
                {formatCurrency(tontine.totalCotisationsReceived)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.collectLabel}>Attendu</Text>
              <Text style={styles.collectValue}>
                {formatCurrency(tontine.totalCotisationsExpected)}
              </Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Infos détaillées */}
        <AnimatedCard index={1} variant="elevated">
          <Text style={styles.sectionTitle}>Informations</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: COLORS.primarySoft }]}>
                <Banknote size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.infoLabel}>Cotisation</Text>
              <Text style={styles.infoValue}>
                {formatCurrency(tontine.montantCotisation)}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: COLORS.successLight }]}>
                <Users size={18} color={COLORS.success} />
              </View>
              <Text style={styles.infoLabel}>Membres</Text>
              <Text style={styles.infoValue}>{tontine.totalSubscriptions}</Text>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: COLORS.warningLight }]}>
                <Clock size={18} color={COLORS.warning} />
              </View>
              <Text style={styles.infoLabel}>Période</Text>
              <Text style={styles.infoValue}>
                {tontine.currentPeriod}/{tontine.totalPeriods}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: COLORS.infoLight }]}>
                <Calendar size={18} color={COLORS.info} />
              </View>
              <Text style={styles.infoLabel}>Jour butoir</Text>
              <Text style={styles.infoValue}>Le {tontine.jourButoir}</Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Dates */}
        <AnimatedCard index={2} variant="elevated">
          <Text style={styles.sectionTitle}>Calendrier</Text>

          <View style={styles.dateRow}>
            <View style={[styles.dateDot, { backgroundColor: COLORS.success }]} />
            <View>
              <Text style={styles.dateLabel}>Début</Text>
              <Text style={styles.dateValue}>{formatDate(tontine.dateDebut)}</Text>
            </View>
          </View>

          <View style={styles.dateLine} />

          <View style={styles.dateRow}>
            <View style={[styles.dateDot, { backgroundColor: COLORS.danger }]} />
            <View>
              <Text style={styles.dateLabel}>Fin prévue</Text>
              <Text style={styles.dateValue}>{formatDate(tontine.dateFin)}</Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Sanctions */}
        <AnimatedCard index={3} variant="elevated">
          <Text style={styles.sectionTitle}>Sanctions</Text>

          <View style={styles.sanctionRow}>
            <View style={styles.sanctionItem}>
              <AlertTriangle size={16} color={COLORS.warning} />
              <Text style={styles.sanctionLabel}>Non bénéficié</Text>
              <Text style={styles.sanctionValue}>
                {formatCurrency(tontine.sanctionNonBeneficiee)}
              </Text>
            </View>
            <View style={styles.sanctionSep} />
            <View style={styles.sanctionItem}>
              <CheckCircle size={16} color={COLORS.success} />
              <Text style={styles.sanctionLabel}>Déjà bénéficié</Text>
              <Text style={styles.sanctionValue}>
                {formatCurrency(tontine.sanctionDejaBeneficiee)}
              </Text>
            </View>
          </View>
        </AnimatedCard>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
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
  bgCircle1: { width: 220, height: 220, top: -60, right: -70 },
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
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.whiteAlpha(0.2),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.white,
    textAlign: 'center',
  },
  headerBadges: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.whiteAlpha(0.15),
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
  },
  headerBadgeText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.semibold,
  },
  scrollView: { flex: 1, marginTop: -SPACING.md },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  // Collecte
  collectCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  collectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  collectTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray800,
  },
  collectPercent: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.success,
  },
  collectBarContainer: { marginBottom: SPACING.md },
  collectBarBg: {
    height: 12,
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  collectBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  collectGradient: { flex: 1 },
  collectAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  collectLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray400,
    marginBottom: 2,
  },
  collectValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray800,
  },
  // Section
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray800,
    marginBottom: SPACING.md,
  },
  // Info grid
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  infoItem: {
    width: '47%',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray400,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray800,
  },
  // Dates
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  dateDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dateLine: {
    width: 2,
    height: 20,
    backgroundColor: COLORS.gray200,
    marginLeft: 5,
  },
  dateLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray400,
  },
  dateValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.gray700,
  },
  // Sanctions
  sanctionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sanctionItem: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  sanctionSep: {
    width: 1,
    height: 50,
    backgroundColor: COLORS.gray200,
    marginHorizontal: SPACING.md,
  },
  sanctionLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray500,
  },
  sanctionValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray800,
  },
  bottomSpacer: { height: SPACING.xxl },
});
