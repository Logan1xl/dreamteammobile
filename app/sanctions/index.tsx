/**
 * ============================================================
 * Écran Sanctions - Dream Team Mobile
 * Liste des sanctions du membre avec statut payé/impayé
 * ============================================================
 */
import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, AlertTriangle, CheckCircle, Clock } from 'lucide-react-native';
import { getMemberSanctions } from '../../src/api/sanctions';
import { useAuthStore } from '../../src/store/useAuthStore';
import AnimatedCard from '../../src/components/common/AnimatedCard';
import EmptyState from '../../src/components/common/EmptyState';
import LoadingScreen from '../../src/components/common/LoadingScreen';
import { SanctionResponse } from '../../src/types';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../src/theme/theme';

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
    } catch (e) { console.log('Err sanctions:', e); }
    finally { setLoading(false); }
  }, [user?.memberId]);

  useEffect(() => { loadSanctions(); }, [loadSanctions]);
  const onRefresh = useCallback(async () => { setRefreshing(true); await loadSanctions(); setRefreshing(false); }, [loadSanctions]);

  const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n || 0) + ' FCFA';
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  const unpaid = sanctions.filter((s) => !s.isPaid);
  const totalUnpaid = unpaid.reduce((sum, s) => sum + (s.remainingAmount || 0), 0);

  if (loading) return <LoadingScreen message="Chargement des sanctions..." />;

  return (
    <View style={s.container}>
      <LinearGradient colors={COLORS.dangerGradient as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.header}>
        <View style={s.bgCircle} />
        <TouchableOpacity style={s.back} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={s.hContent}>
          <AlertTriangle size={28} color={COLORS.white} />
          <Text style={s.hTitle}>Mes Sanctions</Text>
          {unpaid.length > 0 && (
            <View style={s.banner}>
              <Text style={s.bannerText}>{unpaid.length} impayée{unpaid.length > 1 ? 's' : ''}</Text>
              <Text style={s.bannerAmt}>{fmt(totalUnpaid)}</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollC} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.danger]} />}>
        {sanctions.length === 0 ? (
          <EmptyState icon={<CheckCircle size={40} color={COLORS.success} />} title="Aucune sanction 🎉" description="Continuez comme ça !" />
        ) : sanctions.map((sn, i) => (
          <AnimatedCard key={sn.id} index={i} variant="elevated">
            <View style={s.cHeader}>
              <View style={s.cTitleRow}>
                <View style={[s.sIcon, { backgroundColor: sn.isPaid ? COLORS.successLight : COLORS.dangerLight }]}>
                  {sn.isPaid ? <CheckCircle size={18} color={COLORS.success} /> : <Clock size={18} color={COLORS.danger} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.cTitle}>{sn.motif}</Text>
                  <Text style={s.cDate}>{fmtDate(sn.dateSanction)}</Text>
                </View>
              </View>
              <View style={[s.badge, { backgroundColor: sn.isPaid ? COLORS.successLight : COLORS.dangerLight }]}>
                <Text style={[s.badgeT, { color: sn.isPaid ? COLORS.success : COLORS.danger }]}>{sn.isPaid ? 'Payée' : 'Impayée'}</Text>
              </View>
            </View>
            <View style={s.details}>
              <View style={s.dRow}><Text style={s.dLabel}>Total</Text><Text style={s.dVal}>{fmt(sn.montant)}</Text></View>
              <View style={s.dSep} />
              <View style={s.dRow}><Text style={s.dLabel}>Payé</Text><Text style={[s.dVal, { color: COLORS.success }]}>{fmt(sn.montantPaye)}</Text></View>
              {!sn.isPaid && <><View style={s.dSep} /><View style={s.dRow}><Text style={s.dLabel}>Reste</Text><Text style={[s.dVal, { color: COLORS.danger }]}>{fmt(sn.remainingAmount)}</Text></View></>}
            </View>
            {sn.montant > 0 && (
              <View style={s.pBar}><View style={[s.pFill, { width: `${Math.min((sn.montantPaye / sn.montant) * 100, 100)}%`, backgroundColor: sn.isPaid ? COLORS.success : COLORS.warning }]} /></View>
            )}
          </AnimatedCard>
        ))}
        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 50, paddingBottom: SPACING.xxl, paddingHorizontal: SPACING.lg, overflow: 'hidden' },
  bgCircle: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: COLORS.whiteAlpha(0.08), top: -50, right: -60 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.whiteAlpha(0.2), justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  hContent: { alignItems: 'center' },
  hTitle: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.extrabold, color: COLORS.white, marginTop: SPACING.sm },
  banner: { backgroundColor: COLORS.whiteAlpha(0.15), borderRadius: RADIUS.lg, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, marginTop: SPACING.md, alignItems: 'center' },
  bannerText: { fontSize: FONT_SIZE.sm, color: COLORS.whiteAlpha(0.9) },
  bannerAmt: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.extrabold, color: COLORS.white, marginTop: 2 },
  scroll: { flex: 1, marginTop: -SPACING.md },
  scrollC: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm },
  cHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md },
  cTitleRow: { flexDirection: 'row', flex: 1 },
  sIcon: { width: 38, height: 38, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm },
  cTitle: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: COLORS.gray800 },
  cDate: { fontSize: FONT_SIZE.xs, color: COLORS.gray400, marginTop: 2 },
  badge: { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  badgeT: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold },
  details: { backgroundColor: COLORS.gray50, borderRadius: RADIUS.md, padding: SPACING.md },
  dRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.xs + 2 },
  dSep: { height: 1, backgroundColor: COLORS.gray200 },
  dLabel: { fontSize: FONT_SIZE.sm, color: COLORS.gray500 },
  dVal: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: COLORS.gray800 },
  pBar: { height: 6, backgroundColor: COLORS.gray100, borderRadius: RADIUS.full, overflow: 'hidden', marginTop: SPACING.md },
  pFill: { height: '100%', borderRadius: RADIUS.full },
});
