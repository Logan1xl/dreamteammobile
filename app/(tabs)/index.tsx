import React, { useCallback, useState } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../../src/theme/theme';
import { useAuthStore } from '../../src/store/useAuthStore';
import { getMemberDashboard, getAdminDashboard } from '../../src/api/dashboard';
import {
  deleteNotification,
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../../src/api/notifications';
import { MemberDashboardResponse, AdminDashboardResponse, NotificationResponse } from '../../src/types';
import { showErrorAlert } from '../../src/utils/errorUtils';
import { getNotificationTarget } from '../../src/utils/notifications';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => state.isAdmin());
  
  const [stats, setStats] = useState<MemberDashboardResponse | null>(null);
  const [adminStats, setAdminStats] = useState<AdminDashboardResponse | null>(null);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await getMyNotifications(0, 4);
      if (response.success) {
        setNotifications(response.data?.content || []);
      }
    } catch (error) {
      console.log('[Notifications] Chargement ignoré:', error);
    }
  };

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
      await fetchNotifications();
    } catch (error) {
      showErrorAlert(error, 'Tableau de bord');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [isAdmin])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val || 0) + ' FCFA';
  };

  const formatNotificationDate = (value?: string) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  const insuranceRemaining = Math.max(
    0,
    Number(stats?.insuranceTotal || 0) - Number(stats?.insurancePaid || 0)
  );
  const insuranceIsComplete = Boolean(
    stats?.insuranceComplete ||
    (stats?.insuranceTotal && stats?.insurancePaid != null && stats.insurancePaid >= stats.insuranceTotal)
  );
  const insuranceProgressValue = Number(stats?.insuranceProgress || 0);
  const insuranceDisplay = insuranceIsComplete
    ? 'OK'
    : `${insuranceProgressValue > 0 ? Math.max(1, Math.round(insuranceProgressValue)) : 0}%`;

  const actionItems = isAdmin
    ? [
        {
          visible: (adminStats?.pendingPayments || 0) > 0,
          title: 'Paiements à valider',
          description: `${adminStats?.pendingPayments || 0} opération(s) en attente`,
          icon: 'card-outline',
          color: COLORS.primary,
          bg: COLORS.primarySoft,
          route: '/(tabs)/payments',
        },
        {
          visible: (adminStats?.activeTontines || 0) > 0,
          title: 'Suivre les tontines',
          description: `${adminStats?.activeTontines || 0} cycle(s) actif(s)`,
          icon: 'sync-outline',
          color: COLORS.success,
          bg: COLORS.successLight,
          route: '/(tabs)/tontines',
        },
      ]
    : [
        {
          visible: insuranceRemaining > 0,
          title: 'Compléter l’assurance',
          description: `${formatCurrency(insuranceRemaining)} restant`,
          icon: 'shield-checkmark-outline',
          color: COLORS.primary,
          bg: COLORS.primarySoft,
          route: {
            pathname: '/payment/create',
            params: {
              type: 'ASSURANCE',
              amount: String(insuranceRemaining),
              label: 'Fonds de secours',
            },
          },
        },
        {
          visible: (stats?.unpaidSanctions || stats?.pendingSanctions || 0) > 0,
          title: 'Sanctions impayées',
          description: `${stats?.unpaidSanctions || stats?.pendingSanctions || 0} sanction(s) à régulariser`,
          icon: 'alert-circle-outline',
          color: COLORS.danger,
          bg: COLORS.dangerLight,
          route: '/sanctions',
        },
        {
          visible: (stats?.pendingRequests || 0) > 0,
          title: 'Suivre mes requêtes',
          description: `${stats?.pendingRequests || 0} demande(s) enregistrée(s)`,
          icon: 'chatbubbles-outline',
          color: COLORS.info,
          bg: COLORS.infoLight,
          route: '/requests',
        },
      ];

  const visibleActionItems = actionItems.filter((item) => item.visible);

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((items) => items.map((item) => item.id === id ? { ...item, read: true } : item));
    } catch (error) {
      showErrorAlert(error, 'Notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    } catch (error) {
      showErrorAlert(error, 'Notifications');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    const previousNotifications = notifications;
    setNotifications((items) => items.filter((item) => item.id !== id));

    try {
      await deleteNotification(id);
    } catch (error) {
      setNotifications(previousNotifications);
      showErrorAlert(error, 'Notification');
    }
  };

  const handleOpenNotification = async (notification: NotificationResponse) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, read: true } : item));
      } catch (error) {
        showErrorAlert(error, 'Notification');
      }
    }

    router.push(getNotificationTarget(notification) as any);
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
                  {isAdmin
                    ? formatCurrency(adminStats?.totalSavings || 0)
                    : formatCurrency(stats?.savingsBalance ?? stats?.totalSavings ?? 0)}
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
              {isAdmin ? (adminStats?.activeMembers || 0) : (stats?.activeSubscriptions ?? 0)}
            </Text>
            <Text style={styles.statLabel}>{isAdmin ? 'Membres' : 'Tontines'}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: COLORS.successLight }]}>
              <Ionicons name={isAdmin ? "refresh-circle" : "shield-checkmark"} size={20} color={COLORS.successDark} />
            </View>
            <Text style={styles.statValue}>
              {isAdmin
                ? (adminStats?.activeTontines || 0)
                : insuranceDisplay}
            </Text>
            <Text style={styles.statLabel}>{isAdmin ? 'Tontines' : 'Assurance'}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: COLORS.dangerLight }]}>
              <Ionicons name={isAdmin ? "card" : "alert-circle"} size={20} color={COLORS.danger} />
            </View>
            <Text style={styles.statValue}>
              {isAdmin ? (adminStats?.pendingPayments || 0) : (stats?.unpaidSanctions ?? stats?.pendingSanctions ?? 0)}
            </Text>
            <Text style={styles.statLabel}>{isAdmin ? 'Paiements' : 'Sanctions'}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Priorités</Text>
        </View>

        <View style={styles.actionPanel}>
          {visibleActionItems.length > 0 ? (
            visibleActionItems.map((item, index) => (
              <TouchableOpacity
                key={`${item.title}-${index}`}
                style={[
                  styles.actionRow,
                  index > 0 && styles.actionRowBorder,
                ]}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.85}
              >
                <View style={[styles.actionIcon, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon as any} size={21} color={item.color} />
                </View>
                <View style={styles.actionTexts}>
                  <Text style={styles.actionTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.actionDesc} numberOfLines={1}>{item.description}</Text>
                </View>
                <View style={styles.actionChevron}>
                  <Ionicons name="chevron-forward" size={17} color={COLORS.gray400} />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.allClearRow}>
              <View style={styles.allClearIcon}>
                <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
              </View>
              <View style={styles.actionTexts}>
                <Text style={styles.actionTitle}>Tout est à jour</Text>
                <Text style={styles.actionDesc}>Aucune action urgente pour le moment</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Accès Rapides</Text>
        </View>

        <View style={styles.shortcutsContainer}>
          {[
            { label: 'Finances', icon: 'cash-outline', color: COLORS.primary, route: '/(tabs)/payments' },
            { label: 'Tontines', icon: 'sync-outline', color: COLORS.success, route: '/(tabs)/tontines' },
            { label: 'Épargne', icon: 'wallet-outline', color: COLORS.accentDark, route: '/(tabs)/savings' },
            { label: 'Requêtes', icon: 'chatbubbles-outline', color: COLORS.info, route: '/requests' },
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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          {notifications.some((item) => !item.read) && (
            <TouchableOpacity onPress={handleMarkAllRead} hitSlop={10}>
              <Text style={styles.sectionAction}>Tout lu</Text>
            </TouchableOpacity>
          )}
        </View>

        {notifications.length > 0 ? (
          <Animated.View entering={FadeInRight.delay(500)} style={styles.notificationsList}>
            {notifications.map((notification) => (
              <View
                key={notification.id}
                style={[styles.notificationCard, !notification.read && styles.notificationCardUnread]}
              >
                <TouchableOpacity
                  style={styles.notificationOpenArea}
                  onPress={() => handleOpenNotification(notification)}
                  activeOpacity={0.82}
                >
                  <View style={styles.notificationIcon}>
                    <Ionicons
                      name={notification.read ? 'notifications-outline' : 'notifications'}
                      size={20}
                      color={notification.read ? COLORS.gray500 : COLORS.primary}
                    />
                  </View>
                  <View style={styles.notificationBody}>
                    <View style={styles.notificationTop}>
                      <Text style={styles.notificationTitle} numberOfLines={1}>{notification.title}</Text>
                      <Text style={styles.notificationDate}>{formatNotificationDate(notification.createdAt)}</Text>
                    </View>
                    <Text style={styles.notificationMessage} numberOfLines={2}>{notification.message}</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.notificationActions}>
                  {!notification.read && (
                    <TouchableOpacity
                      style={styles.notificationActionButton}
                      onPress={() => handleMarkNotificationRead(notification.id)}
                      hitSlop={10}
                    >
                      <Ionicons name="checkmark-circle-outline" size={15} color={COLORS.success} />
                      <Text style={[styles.notificationActionText, { color: COLORS.success }]}>Lu</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.notificationActionButton}
                    onPress={() => handleDeleteNotification(notification.id)}
                    hitSlop={10}
                  >
                    <Ionicons name="trash-outline" size={15} color={COLORS.danger} />
                    <Text style={[styles.notificationActionText, { color: COLORS.danger }]}>Effacer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInRight.delay(500)} style={styles.infoCard}>
            <View style={styles.infoContent}>
              <View style={styles.infoIcon}>
                <Ionicons name="information-circle" size={24} color={COLORS.accent} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Message Express</Text>
                <Text style={styles.infoDesc}>
                  {isAdmin ? 'Aucune notification récente.' : 'Aucune notification récente.'}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}
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
  sectionHeader: { paddingHorizontal: SPACING.lg, marginVertical: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: COLORS.primaryDeep, textTransform: 'uppercase', letterSpacing: 1 },
  sectionAction: { fontSize: 12, fontWeight: 'bold', color: COLORS.primary },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SPACING.lg },
  statCard: { width: (width - 60) / 3, backgroundColor: COLORS.white, borderRadius: 16, padding: 15, alignItems: 'center', ...SHADOWS.soft },
  statIconContainer: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.primaryDeep },
  statLabel: { fontSize: 10, color: COLORS.gray500, marginTop: 2 },
  actionPanel: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    overflow: 'hidden',
    ...SHADOWS.soft,
  },
  actionRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  actionRowBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionTexts: { flex: 1 },
  actionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.primaryDeep },
  actionDesc: { fontSize: 11, color: COLORS.gray500, marginTop: 3 },
  actionChevron: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  allClearRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  allClearIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shortcutsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: 16,
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
  notificationsList: { marginHorizontal: SPACING.lg, gap: 10, marginBottom: 20 },
  notificationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    ...SHADOWS.soft,
  },
  notificationCardUnread: { backgroundColor: COLORS.primarySoft },
  notificationOpenArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationBody: { flex: 1 },
  notificationTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  notificationTitle: { flex: 1, fontSize: 13, fontWeight: 'bold', color: COLORS.primaryDeep },
  notificationDate: { fontSize: 10, color: COLORS.gray500 },
  notificationMessage: { marginTop: 3, fontSize: 11, color: COLORS.gray600, lineHeight: 16 },
  notificationActions: { flexDirection: 'row', gap: 12, marginTop: 10, paddingLeft: 50 },
  notificationActionButton: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 30 },
  notificationActionText: { fontSize: 11, fontWeight: 'bold' },
});
