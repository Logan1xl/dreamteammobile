/**
 * ============================================================
 * Dashboard (Accueil) - Dream Team Mobile
 * Affiche les KPIs du membre, progression assurance,
 * actions rapides et état de l'épargne/sanctions
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
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  CreditCard,
  Repeat,
  PiggyBank,
  AlertTriangle,
  MessageSquare,
  Shield,
  TrendingUp,
  ChevronRight,
  Bell,
} from 'lucide-react-native';
import { useAuthStore } from '../../src/store/useAuthStore';
import { getMemberDashboard } from '../../src/api/dashboard';
import { getMyMemberProfile } from '../../src/api/members';
import AnimatedCard from '../../src/components/common/AnimatedCard';
import { MemberDashboardResponse } from '../../src/types';
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOWS,
} from '../../src/theme/theme';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const fullName = useAuthStore((s) => s.fullName);

  const [dashboard, setDashboard] = useState<MemberDashboardResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Animation de la barre de progression assurance
  const progressWidth = useSharedValue(0);

  /**
   * Charge les données du dashboard depuis l'API
   */
  const loadDashboard = useCallback(async () => {
    try {
      // 1. Tenter de récupérer le dashboard
      const response = await getMemberDashboard();
      if (response.success && response.data) {
        setDashboard(response.data);
        
        // Si le memberId est connu mais pas dans le store, on le met à jour
        if (!user?.memberId && response.data.memberId) {
          updateUser({ memberId: response.data.memberId, memberMatricule: response.data.matricule });
        }

        const progress = Math.min(response.data.insuranceProgress || 0, 100);
        progressWidth.value = withDelay(
          500,
          withSpring(progress, { damping: 20, stiffness: 80 })
        );
      }
    } catch (error: any) {
      console.log('Erreur dashboard:', error);
      
      // 2. Si ça échoue parce que le membre n'est pas encore apparié (ou erreur API), 
      // on tente de vérifier le profil membre spécifiquement si memberId est absent
      if (!user?.memberId) {
        try {
          const res = await getMyMemberProfile();
          if (res.success && res.data?.id) {
            updateUser({ memberId: res.data.id, memberMatricule: res.data.matricule });
            // Relancer le chargement du dashboard maintenant qu'on a le lien
            setTimeout(loadDashboard, 100);
          }
        } catch (meError) {
          console.log('Impossible de récupérer le profil membre:', meError);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user?.memberId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /**
   * Rafraîchissement par pull-to-refresh
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  }, [loadDashboard]);

  // Style animé de la barre de progression
  const progressAnimStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  /**
   * Formatte un montant en FCFA
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR').format(amount || 0) + ' FCFA';
  };

  /**
   * Détermine le message de salutation selon l'heure
   */
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  // Actions rapides affichées sur le dashboard
  const quickActions = [
    {
      icon: <CreditCard size={22} color={COLORS.white} />,
      label: 'Payer',
      colors: COLORS.primaryGradient,
      onPress: () => router.push('/payment/create'),
    },
    {
      icon: <Repeat size={22} color={COLORS.white} />,
      label: 'Tontines',
      colors: COLORS.successGradient,
      onPress: () => router.push('/(tabs)/tontines'),
    },
    {
      icon: <MessageSquare size={22} color={COLORS.white} />,
      label: 'Requêtes',
      colors: COLORS.warningGradient,
      onPress: () => router.push('/requests'),
    },
    {
      icon: <AlertTriangle size={22} color={COLORS.white} />,
      label: 'Sanctions',
      colors: COLORS.dangerGradient,
      onPress: () => router.push('/sanctions'),
    },
  ];

  return (
    <View style={styles.container}>
      {/* En-tête avec dégradé */}
      <LinearGradient
        colors={COLORS.primaryGradient as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={[styles.bgCircle, styles.bgCircle1]} />
        <View style={[styles.bgCircle, styles.bgCircle2]} />

        <View style={styles.headerTopRow}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.prenoms?.[0] || 'D'}{user?.nom?.[0] || 'T'}
              </Text>
            </View>
            <View>
              <Text style={styles.greeting}>{getGreeting()} 👋</Text>
              <Text style={styles.userName}>{fullName()}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notifButton}>
            <Bell size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Matricule */}
        {dashboard?.matricule && (
          <View style={styles.matriculeContainer}>
            <Text style={styles.matriculeLabel}>Matricule</Text>
            <Text style={styles.matriculeValue}>{dashboard.matricule}</Text>
          </View>
        )}
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
            tintColor={COLORS.primary}
          />
        }
      >
        {/* === Carte Assurance === */}
        <AnimatedCard index={0} variant="elevated" style={styles.insuranceCard}>
          <View style={styles.insuranceHeader}>
            <View style={styles.insuranceIconBox}>
              <Shield size={20} color={COLORS.primary} />
            </View>
            <View style={styles.insuranceTexts}>
              <Text style={styles.insuranceTitle}>Fonds de Secours</Text>
              <Text style={styles.insuranceSubtitle}>
                {dashboard?.canReceiveHelp
                  ? '✅ Éligible à l\'aide'
                  : '⏳ Complétez vos cotisations'}
              </Text>
            </View>
          </View>

          {/* Barre de progression animée */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, progressAnimStyle]}>
                <LinearGradient
                  colors={COLORS.successGradient as unknown as [string, string, ...string[]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressGradient}
                />
              </Animated.View>
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressPaid}>
                {formatCurrency(dashboard?.insurancePaid || 0)}
              </Text>
              <Text style={styles.progressTotal}>
                / {formatCurrency(dashboard?.insuranceTotal || 0)}
              </Text>
            </View>
            <Text style={styles.progressPercent}>
              {Math.round(dashboard?.insuranceProgress || 0)}%
            </Text>
          </View>
        </AnimatedCard>

        {/* === Actions Rapides === */}
        <Text style={styles.sectionTitle}>Actions Rapides</Text>
        <View style={styles.quickActionsRow}>
          {quickActions.map((action, idx) => (
            <AnimatedCard
              key={idx}
              index={idx + 1}
              style={styles.quickActionCard}
              variant="default"
            >
              <TouchableOpacity
                style={styles.quickAction}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={action.colors as unknown as [string, string, ...string[]]}
                  style={styles.quickActionIcon}
                >
                  {action.icon}
                </LinearGradient>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            </AnimatedCard>
          ))}
        </View>

        {/* === Résumé Financier === */}
        <Text style={styles.sectionTitle}>Résumé</Text>

        {/* Épargne */}
        <AnimatedCard index={5} variant="elevated">
          <TouchableOpacity
            style={styles.summaryRow}
            onPress={() => router.push('/(tabs)/savings')}
            activeOpacity={0.7}
          >
            <View style={[styles.summaryIcon, { backgroundColor: COLORS.successLight }]}>
              <PiggyBank size={22} color={COLORS.success} />
            </View>
            <View style={styles.summaryTexts}>
              <Text style={styles.summaryLabel}>Mon Épargne</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(dashboard?.savingsBalance || 0)}
              </Text>
            </View>
            <ChevronRight size={20} color={COLORS.gray400} />
          </TouchableOpacity>
        </AnimatedCard>

        {/* Sanctions impayées */}
        <AnimatedCard index={6} variant="elevated">
          <TouchableOpacity
            style={styles.summaryRow}
            onPress={() => router.push('/sanctions')}
            activeOpacity={0.7}
          >
            <View style={[styles.summaryIcon, { backgroundColor: COLORS.dangerLight }]}>
              <AlertTriangle size={22} color={COLORS.danger} />
            </View>
            <View style={styles.summaryTexts}>
              <Text style={styles.summaryLabel}>Sanctions Impayées</Text>
              <Text
                style={[
                  styles.summaryValue,
                  (dashboard?.unpaidSanctions || 0) > 0 && { color: COLORS.danger },
                ]}
              >
                {dashboard?.unpaidSanctions || 0}
              </Text>
            </View>
            <ChevronRight size={20} color={COLORS.gray400} />
          </TouchableOpacity>
        </AnimatedCard>

        {/* Requêtes en attente */}
        <AnimatedCard index={7} variant="elevated">
          <TouchableOpacity
            style={styles.summaryRow}
            onPress={() => router.push('/requests')}
            activeOpacity={0.7}
          >
            <View style={[styles.summaryIcon, { backgroundColor: COLORS.warningLight }]}>
              <MessageSquare size={22} color={COLORS.warning} />
            </View>
            <View style={styles.summaryTexts}>
              <Text style={styles.summaryLabel}>Mes Requêtes</Text>
              <Text style={styles.summaryValue}>
                {dashboard?.pendingRequests || 0} en attente
              </Text>
            </View>
            <ChevronRight size={20} color={COLORS.gray400} />
          </TouchableOpacity>
        </AnimatedCard>

        {/* Espace en bas pour le tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
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
    backgroundColor: COLORS.whiteAlpha(0.06),
  },
  bgCircle1: { width: 250, height: 250, top: -60, right: -80 },
  bgCircle2: { width: 150, height: 150, bottom: -30, left: -40 },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.whiteAlpha(0.25),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.whiteAlpha(0.4),
  },
  avatarText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  greeting: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.whiteAlpha(0.8),
  },
  userName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  notifButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.whiteAlpha(0.15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  matriculeContainer: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.whiteAlpha(0.12),
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
  },
  matriculeLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.whiteAlpha(0.7),
    marginRight: SPACING.xs,
  },
  matriculeValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    letterSpacing: 1,
  },
  // ScrollView
  scrollView: {
    flex: 1,
    marginTop: -SPACING.lg,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray800,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  // Carte Assurance
  insuranceCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  insuranceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  insuranceIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  insuranceTexts: {
    flex: 1,
  },
  insuranceTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray800,
  },
  insuranceSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    marginTop: 2,
  },
  // Progression
  progressContainer: {
    marginTop: SPACING.sm,
  },
  progressBar: {
    height: 10,
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressGradient: {
    flex: 1,
  },
  progressLabels: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
  },
  progressPaid: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.success,
  },
  progressTotal: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray400,
    marginLeft: SPACING.xs,
  },
  progressPercent: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.primary,
  },
  // Actions rapides
  quickActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - SPACING.lg * 2 - SPACING.sm * 3) / 4,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.gray700,
    textAlign: 'center',
  },
  // Résumé
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  summaryTexts: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray800,
  },
  bottomSpacer: {
    height: SPACING.xxl,
  },
});
