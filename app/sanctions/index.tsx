/**
 * ============================================================
 * Écran Sanctions - Dream Team Mobile
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
import { getMemberSanctions } from '../../src/api/sanctions';
import { useAuthStore } from '../../src/store/useAuthStore';
import AnimatedCard from '../../src/components/common/AnimatedCard';
import EmptyState from '../../src/components/common/EmptyState';
import LoadingScreen from '../../src/components/common/LoadingScreen';
import { SanctionResponse } from '../../src/types';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../../src/theme/theme';

const { width } = Dimensions.get('window');

export default function SanctionsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [sanctions, setSanctions] = useState<SanctionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSanctions = useCallback(async () => {
    if (!user?.memberId) { setLoading(false); return; }
    try {
      const res = await getMemberSanctions(user.memberId);
      if (res.success && res.data) setSanctions(res.data.content || []);
    } catch (e) { 
      console.log('Err sanctions:', e); 
    } finally { 
      setLoading(false); 
    }
  }, [user?.memberId]);

  useEffect(() => { loadSanctions(); }, [loadSanctions]);

  const onRefresh = useCallback(async () => { 
    setRefreshing(true); 
    await loadSanctions(); 
    setRefreshing(false); 
  }, [loadSanctions]);

  const formatCurrency = (n: number) => new Intl.NumberFormat('fr-FR').format(n || 0) + ' FCFA';
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  const unpaid = sanctions.filter((s) => !s.isPaid);
  const totalUnpaid = unpaid.reduce((sum, s) => sum + (s.remainingAmount || 0), 0);

  if (loading) return <LoadingScreen message="Chargement de vos sanctions..." />;

  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={COLORS.dangerGradient as any} 
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
            <Ionicons name="alert-circle" size={32} color={COLORS.white} />
          </View>
          <Text style={styles.headerTitle}>Mes Sanctions</Text>
          
          {unpaid.length > 0 && (
            <View style={styles.summaryBanner}>
              <View>
                <Text style={styles.summaryLabel}>{unpaid.length} Sanction{unpaid.length > 1 ? 's' : ''} impayée{unpaid.length > 1 ? 's' : ''}</Text>
                <Text style={styles.summaryAmount}>{formatCurrency(totalUnpaid)}</Text>
              </View>
              <Ionicons name="warning" size={32} color={COLORS.whiteAlpha(0.3)} />
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.danger]} tintColor={COLORS.danger} />
        }
      >
        {sanctions.length === 0 ? (
          <EmptyState 
            icon={<Ionicons name="checkmark-circle" size={80} color={COLORS.success} />} 
            title="Aucune sanction 🎉" 
            description="Votre dossier est impeccable. Continuez à respecter les règles de l'association !" 
          />
        ) : (
          sanctions.map((sn, i) => (
            <AnimatedCard key={sn.id} index={i} variant="elevated" style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.titleColumn}>
                  <View style={[styles.statusIcon, { backgroundColor: sn.isPaid ? COLORS.successLight : COLORS.dangerLight }]}>
                    <Ionicons 
                      name={sn.isPaid ? "checkmark-done" : "timer-outline"} 
                      size={20} 
                      color={sn.isPaid ? COLORS.success : COLORS.danger} 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sanctionMotif}>{sn.motif}</Text>
                    <Text style={styles.sanctionDate}>{formatDate(sn.dateSanction)}</Text>
                  </View>
                </View>
                <View style={[styles.badge, { backgroundColor: sn.isPaid ? COLORS.successSoft : COLORS.dangerSoft }]}>
                  <Text style={[styles.badgeText, { color: sn.isPaid ? COLORS.successDark : COLORS.danger }]}>
                    {sn.isPaid ? 'Régularisée' : 'En attente'}
                  </Text>
                </View>
              </View>

              <View style={styles.detailsBox}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Montant Initial</Text>
                  <Text style={styles.detailValue}>{formatCurrency(sn.montant)}</Text>
                </View>
                <View style={styles.separator} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Versé</Text>
                  <Text style={[styles.detailValue, { color: COLORS.success }]}>{formatCurrency(sn.montantPaye)}</Text>
                </View>
                {!sn.isPaid && (
                  <>
                    <View style={styles.separator} />
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Reste à payer</Text>
                      <Text style={[styles.detailValue, { color: COLORS.danger, fontSize: 16 }]}>
                        {formatCurrency(sn.remainingAmount)}
                      </Text>
                    </View>
                  </>
                )}
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                  <View style={[
                    styles.progressBarFill, 
                    { 
                      width: `${Math.min((sn.montantPaye / sn.montant) * 100, 100)}%`, 
                      backgroundColor: sn.isPaid ? COLORS.success : COLORS.warning 
                    }
                  ]} />
                </View>
              </View>
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
    backgroundColor: COLORS.whiteAlpha(0.1), 
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
    width: 60,
    height: 60,
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
  summaryBanner: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.whiteAlpha(0.15), 
    borderRadius: RADIUS.xl, 
    paddingHorizontal: SPACING.lg, 
    paddingVertical: SPACING.md, 
    marginTop: SPACING.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.whiteAlpha(0.1)
  },
  summaryLabel: { fontSize: 12, color: COLORS.whiteAlpha(0.8), fontWeight: '600' },
  summaryAmount: { fontSize: 22, fontWeight: FONT_WEIGHT.extrabold, color: COLORS.white, marginTop: 2 },
  
  scrollView: { flex: 1, marginTop: -20 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  
  card: { 
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: SPACING.lg 
  },
  titleColumn: { flexDirection: 'row', flex: 1, alignItems: 'center' },
  statusIcon: { 
    width: 42, 
    height: 42, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: SPACING.md 
  },
  sanctionMotif: { fontSize: 16, fontWeight: '700', color: COLORS.primaryDeep, letterSpacing: -0.3 },
  sanctionDate: { fontSize: 12, color: COLORS.gray400, marginTop: 4, fontWeight: '500' },
  
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full },
  badgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  
  detailsBox: { 
    backgroundColor: COLORS.gray50, 
    borderRadius: RADIUS.lg, 
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  separator: { height: 1, backgroundColor: COLORS.gray200, opacity: 0.5 },
  detailLabel: { fontSize: 13, color: COLORS.gray500, fontWeight: '500' },
  detailValue: { fontSize: 15, fontWeight: '700', color: COLORS.primaryDeep },
  
  progressContainer: { marginTop: SPACING.lg },
  progressBarBg: { height: 8, backgroundColor: COLORS.gray100, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
});
