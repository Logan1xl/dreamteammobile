/**
 * ============================================================
 * Écran Requêtes - Dream Team Mobile
 * Design Premium harmonisé avec Ionicons et Gradients
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
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMemberRequests } from '../../src/api/requests';
import { useAuthStore } from '../../src/store/useAuthStore';
import AnimatedCard from '../../src/components/common/AnimatedCard';
import StatusBadge from '../../src/components/common/StatusBadge';
import EmptyState from '../../src/components/common/EmptyState';
import LoadingScreen from '../../src/components/common/LoadingScreen';
import { RequestResponse } from '../../src/types';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../../src/theme/theme';

const { width } = Dimensions.get('window');

export default function RequestsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [requests, setRequests] = useState<RequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRequests = useCallback(async () => {
    if (!user?.memberId) { setLoading(false); return; }
    try {
      const res = await getMemberRequests(user.memberId);
      if (res.success && res.data) setRequests(res.data.content || []);
    } catch (e) { 
      console.log('Err requêtes:', e); 
    } finally { 
      setLoading(false); 
    }
  }, [user?.memberId]);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const onRefresh = useCallback(async () => { 
    setRefreshing(true); 
    await loadRequests(); 
    setRefreshing(false); 
  }, [loadRequests]);

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  if (loading) return <LoadingScreen message="Chargement de vos demandes..." />;

  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={COLORS.primaryGradient as any} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 1 }} 
        style={styles.header}
      >
        <View style={styles.bgCircle} />
        
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="chatbubbles" size={32} color={COLORS.white} />
          </View>
          <Text style={styles.headerTitle}>Assistance & Requêtes</Text>
          <Text style={styles.headerSubtitle}>{requests.length} demande{requests.length > 1 ? 's' : ''} enregistrée{requests.length > 1 ? 's' : ''}</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
        }
      >
        {/* Bouton nouvelle requête Premium */}
        <AnimatedCard index={0} variant="elevated" style={styles.newActionCard}>
          <TouchableOpacity style={styles.newActionContent} onPress={() => router.push('/requests/create')} activeOpacity={0.8}>
            <LinearGradient colors={COLORS.accentGradient as any} style={styles.plusIcon}>
              <Ionicons name="add" size={28} color={COLORS.white} />
            </LinearGradient>
            <View style={styles.newActionText}>
              <Text style={styles.newActionTitle}>Nouvelle Demande</Text>
              <Text style={styles.newActionSub}>Aide, Information ou Réclamation</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray300} />
          </TouchableOpacity>
        </AnimatedCard>

        {requests.length === 0 ? (
          <EmptyState 
            icon={<Ionicons name="chatbox-ellipses-outline" size={80} color={COLORS.gray200} />} 
            title="Aucune requête en cours" 
            description="Vous n'avez soumis aucune demande pour le moment. Besoin d'aide ? Utilisez le bouton ci-dessus." 
          />
        ) : (
          requests.map((req, i) => (
            <AnimatedCard key={req.id} index={i + 1} variant="elevated" style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.titleColumn}>
                  <Text style={styles.requestMotif} numberOfLines={1}>{req.motif}</Text>
                  <Text style={styles.requestDate}>{formatDate(req.dateRequete || req.createdAt)}</Text>
                </View>
                <StatusBadge status={req.status} size="sm" />
              </View>

              <Text style={styles.requestDesc}>{req.description}</Text>

              {req.reponse && (
                <View style={styles.responseContainer}>
                  <View style={styles.reponseHeader}>
                    <Ionicons name="return-down-forward" size={14} color={COLORS.success} />
                    <Text style={styles.reponseLabel}>Réponse Officielle</Text>
                  </View>
                  <Text style={styles.reponseText}>{req.reponse}</Text>
                </View>
              )}
            </AnimatedCard>
          ))
        )}
        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    paddingTop: 60, 
    paddingBottom: 40, 
    paddingHorizontal: SPACING.lg, 
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
    ...SHADOWS.medium
  },
  bgCircle: { 
    position: 'absolute', 
    width: 250, 
    height: 250, 
    borderRadius: 125, 
    backgroundColor: COLORS.whiteAlpha(0.08), 
    top: -50, 
    right: -80 
  },
  backBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    backgroundColor: COLORS.whiteAlpha(0.2), 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: SPACING.lg 
  },
  headerContent: { alignItems: 'flex-start' },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: COLORS.whiteAlpha(0.2),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: FONT_WEIGHT.extrabold, 
    color: COLORS.white,
    letterSpacing: -0.5
  },
  headerSubtitle: { 
    fontSize: 14, 
    color: COLORS.whiteAlpha(0.7), 
    marginTop: 4,
    fontWeight: '500'
  },
  
  scrollView: { flex: 1, marginTop: -20 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  
  newActionCard: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.xl,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.accent
  },
  newActionContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: SPACING.md + 4 
  },
  plusIcon: { 
    width: 50, 
    height: 50, 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: SPACING.md,
    ...SHADOWS.glow
  },
  newActionText: { flex: 1 },
  newActionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.primaryDeep },
  newActionSub: { fontSize: 12, color: COLORS.gray500, marginTop: 2, fontWeight: '500' },

  card: { 
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: SPACING.md 
  },
  titleColumn: { flex: 1, marginRight: 10 },
  requestMotif: { fontSize: 16, fontWeight: '700', color: COLORS.primaryDeep },
  requestDate: { fontSize: 12, color: COLORS.gray400, marginTop: 2 },
  
  requestDesc: { fontSize: 14, color: COLORS.gray600, lineHeight: 21, marginBottom: SPACING.md },
  
  responseContainer: { 
    backgroundColor: COLORS.successLight, 
    borderRadius: RADIUS.lg, 
    padding: SPACING.md, 
    marginTop: 5,
    borderWidth: 1,
    borderColor: COLORS.success + '20'
  },
  reponseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 },
  reponseLabel: { fontSize: 10, fontWeight: '800', color: COLORS.successDark, textTransform: 'uppercase', letterSpacing: 0.5 },
  reponseText: { fontSize: 14, color: COLORS.gray700, lineHeight: 21, fontWeight: '500' },
});
