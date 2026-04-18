import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, { 
  FadeInDown, 
  FadeInRight,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../../src/theme/theme';
import { useAuthStore } from '../../src/store/useAuthStore';
import { getMemberDashboard, getAdminDashboard } from '../../src/api/dashboard';
import { MemberDashboardResponse, AdminDashboardResponse } from '../../src/types';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => state.isAdmin());
  
  const [stats, setStats] = useState<MemberDashboardResponse | null>(null);
  const [adminStats, setAdminStats] = useState<AdminDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      if (isAdmin) {
        // Si c'est un admin, on appelle le dashboard admin
        const response = await getAdminDashboard();
        if (response.success) setAdminStats(response.data);
      } else {
        // Sinon dashboard membre
        const response = await getMemberDashboard();
        if (response.success) setStats(response.data);
      }
    } catch (error) {
      console.error('Erreur stats mobile:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val || 0) + ' FCFA';
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.gray500, fontWeight: 'bold' }}>Chargement Premium...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.userName}>{user?.prenoms || 'Utilisateur'}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{isAdmin ? 'AD' : 'MB'}</Text>
          </View>
        </View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.balanceCard}>
          <LinearGradient
            colors={COLORS.primaryGradient}
            style={styles.balanceGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <View style={styles.balanceTop}>
              <View>
                <Text style={styles.balanceLabel}>{isAdmin ? 'FLUX GLOBAL ASSOCIATION' : 'ÉPARGNE TOTALE'}</Text>
                <Text style={styles.balanceAmount}>
                  {isAdmin ? formatCurrency(adminStats?.totalSavings || 0) : formatCurrency(stats?.totalSavings || 0)}
                </Text>
              </View>
              <View style={styles.iconCircle}>
                <Ionicons name={isAdmin ? "stats-chart" : "wallet-outline"} size={24} color={COLORS.accent} />
              </View>
            </View>
            <View style={styles.balanceFooter}>
              <View style={styles.badge}>
                <Ionicons name="shield-checkmark" size={12} color={COLORS.success} />
                <Text style={styles.badgeText}>{isAdmin ? 'Admin Mode' : 'Actif'}</Text>
              </View>
              <Text style={styles.accountNumber}>{user?.memberMatricule || 'Dream Team'}</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{isAdmin ? 'Statistiques Générales' : 'Ma Situation'}</Text>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: COLORS.accentSoft }]}>
              <Ionicons name={isAdmin ? "people" : "repeat"} size={20} color={COLORS.accentDark} />
            </View>
            <Text style={styles.statValue}>
              {isAdmin ? (adminStats?.activeMembers || 0) : (stats?.activeSubscriptions || 0)}
            </Text>
            <Text style={styles.statLabel}>{isAdmin ? 'Membres' : 'Tontines'}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: COLORS.successLight }]}>
              <Ionicons name={isAdmin ? "refresh-circle" : "shield-checkmark"} size={20} color={COLORS.successDark} />
            </View>
            <Text style={styles.statValue}>
              {isAdmin ? (adminStats?.activeTontines || 0) : (stats?.insurancePaid ? 'OK' : '1/2')}
            </Text>
            <Text style={styles.statLabel}>{isAdmin ? 'Tontines' : 'Assurance'}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: COLORS.dangerLight }]}>
              <Ionicons name={isAdmin ? "card" : "alert-circle"} size={20} color={COLORS.danger} />
            </View>
            <Text style={styles.statValue}>
              {isAdmin ? (adminStats?.pendingPayments || 0) : (stats?.pendingSanctions || 0)}
            </Text>
            <Text style={styles.statLabel}>{isAdmin ? 'Paiements' : 'Sanctions'}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Accès Rapides</Text>
        </View>

        <View style={styles.shortcutsContainer}>
          {[
            { label: 'Finances', icon: 'cash-outline', color: COLORS.primary, route: '/(tabs)/payments' },
            { label: 'Tontines', icon: 'sync-outline', color: COLORS.success, route: '/(tabs)/tontines' },
            { label: 'Épargne', icon: 'wallet-outline', color: COLORS.accentDark, route: '/(tabs)/savings' },
            { label: 'Profil', icon: 'person-outline', color: COLORS.gray500, route: '/(tabs)/profile' },
          ].map((item, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={styles.shortcutItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.shortcutIcon}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <Text style={styles.shortcutLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Animated.View entering={FadeInRight.delay(500)} style={styles.infoCard}>
          <View style={styles.infoContent}>
            <View style={styles.infoIcon}>
              <Ionicons name="information-circle" size={24} color={COLORS.accent} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Message Express</Text>
              <Text style={styles.infoDesc}>
                {isAdmin ? 'Vous avez des candidatures en attente de validation.' : 'Votre cotisation du mois est disponible.'}
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 20,
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
    ...SHADOWS.soft,
    zIndex: 10,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, color: COLORS.gray500, textTransform: 'uppercase' },
  userName: { fontSize: FONT_SIZE.xxl, fontWeight: 'bold', color: COLORS.primaryDeep },
  avatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.primarySoft, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },
  balanceCard: { width: '100%', ...SHADOWS.glow },
  balanceGradient: { borderRadius: RADIUS.xl, padding: SPACING.lg },
  balanceTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  balanceLabel: { fontSize: 10, fontWeight: 'bold', color: COLORS.whiteAlpha(0.6) },
  balanceAmount: { fontSize: FONT_SIZE.xxl, fontWeight: '800', color: COLORS.white, marginTop: 4 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.whiteAlpha(0.1), justifyContent: 'center', alignItems: 'center' },
  balanceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, borderTopWidth: 1, borderTopColor: COLORS.whiteAlpha(0.1) },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 9, fontWeight: 'bold', color: COLORS.success, marginLeft: 4 },
  accountNumber: { fontSize: 11, fontWeight: 'bold', color: COLORS.whiteAlpha(0.8) },
  scrollContent: { paddingTop: 20, paddingBottom: 100 },
  sectionHeader: { paddingHorizontal: SPACING.lg, marginVertical: 15 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: COLORS.primaryDeep, textTransform: 'uppercase', letterSpacing: 1 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SPACING.lg },
  statCard: { width: (width - 60) / 3, backgroundColor: COLORS.white, borderRadius: 16, padding: 15, alignItems: 'center', ...SHADOWS.soft },
  statIconContainer: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.primaryDeep },
  statLabel: { fontSize: 10, color: COLORS.gray500, marginTop: 2 },
  shortcutsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: SPACING.lg,
    zIndex: 100 // Assure que les clics passent
  },
  shortcutItem: { 
    alignItems: 'center', 
    width: (width - SPACING.lg * 2 - 30) / 4 
  },
  shortcutIcon: { 
    width: 60, 
    height: 60, 
    borderRadius: 20, 
    backgroundColor: COLORS.white, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 8, 
    ...SHADOWS.soft,
    borderWidth: 1,
    borderColor: COLORS.gray100
  },
  shortcutLabel: { 
    fontSize: 11, 
    fontWeight: 'bold', 
    color: COLORS.primaryDeep,
    textAlign: 'center'
  },
  infoCard: { marginHorizontal: SPACING.lg, backgroundColor: COLORS.white, borderRadius: 16, padding: 15, flexDirection: 'row', alignItems: 'center', ...SHADOWS.soft, marginTop: 20 },
  infoContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  infoIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: COLORS.accentSoft, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  infoTextContainer: { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.primaryDeep },
  infoDesc: { fontSize: 11, color: COLORS.gray500 },
});
