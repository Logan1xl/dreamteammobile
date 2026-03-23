/**
 * ============================================================
 * Écran Requêtes - Dream Team Mobile
 * Liste des requêtes du membre et lien vers création
 * ============================================================
 */
import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, MessageSquare, Plus, ChevronRight } from 'lucide-react-native';
import { getMemberRequests } from '../../src/api/requests';
import { useAuthStore } from '../../src/store/useAuthStore';
import AnimatedCard from '../../src/components/common/AnimatedCard';
import StatusBadge from '../../src/components/common/StatusBadge';
import EmptyState from '../../src/components/common/EmptyState';
import LoadingScreen from '../../src/components/common/LoadingScreen';
import { RequestResponse } from '../../src/types';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../src/theme/theme';

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
    } catch (e) { console.log('Err requêtes:', e); }
    finally { setLoading(false); }
  }, [user?.memberId]);

  useEffect(() => { loadRequests(); }, [loadRequests]);
  const onRefresh = useCallback(async () => { setRefreshing(true); await loadRequests(); setRefreshing(false); }, [loadRequests]);
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  if (loading) return <LoadingScreen message="Chargement des requêtes..." />;

  return (
    <View style={st.container}>
      <LinearGradient colors={COLORS.warningGradient as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.header}>
        <View style={st.bgC} />
        <TouchableOpacity style={st.back} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={st.hContent}>
          <MessageSquare size={28} color={COLORS.white} />
          <Text style={st.hTitle}>Mes Requêtes</Text>
          <Text style={st.hSub}>{requests.length} requête{requests.length > 1 ? 's' : ''}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={st.scroll} contentContainerStyle={st.scrollC} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.warning]} />}>

        {/* Bouton nouvelle requête */}
        <AnimatedCard index={0} variant="elevated" style={st.newCard}>
          <TouchableOpacity style={st.newRow} onPress={() => router.push('/requests/create')} activeOpacity={0.7}>
            <LinearGradient colors={COLORS.warningGradient as any} style={st.newIcon}>
              <Plus size={24} color={COLORS.white} />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={st.newTitle}>Nouvelle requête</Text>
              <Text style={st.newSub}>Soumettre une demande à l'administration</Text>
            </View>
            <ChevronRight size={20} color={COLORS.gray400} />
          </TouchableOpacity>
        </AnimatedCard>

        {requests.length === 0 ? (
          <EmptyState icon={<MessageSquare size={40} color={COLORS.gray400} />} title="Aucune requête" description="Vos requêtes apparaîtront ici."
            actionLabel="Créer une requête" onAction={() => router.push('/requests/create')} />
        ) : requests.map((req, i) => (
          <AnimatedCard key={req.id} index={i + 1} variant="default">
            <View style={st.cHeader}>
              <View style={{ flex: 1 }}>
                <Text style={st.cTitle} numberOfLines={1}>{req.motif}</Text>
                <Text style={st.cDate}>{fmtDate(req.dateRequete || req.createdAt)}</Text>
              </View>
              <StatusBadge status={req.status} size="sm" />
            </View>
            <Text style={st.cDesc} numberOfLines={2}>{req.description}</Text>
            {req.reponse && (
              <View style={st.reponseBox}>
                <Text style={st.reponseLabel}>Réponse de l'administration :</Text>
                <Text style={st.reponseText}>{req.reponse}</Text>
              </View>
            )}
          </AnimatedCard>
        ))}
        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 50, paddingBottom: SPACING.xxl, paddingHorizontal: SPACING.lg, overflow: 'hidden' },
  bgC: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: COLORS.whiteAlpha(0.08), top: -50, right: -60 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.whiteAlpha(0.2), justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  hContent: { alignItems: 'center' },
  hTitle: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.extrabold, color: COLORS.white, marginTop: SPACING.sm },
  hSub: { fontSize: FONT_SIZE.md, color: COLORS.whiteAlpha(0.8), marginTop: SPACING.xs },
  scroll: { flex: 1, marginTop: -SPACING.md },
  scrollC: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm },
  newCard: { borderLeftWidth: 4, borderLeftColor: COLORS.warning },
  newRow: { flexDirection: 'row', alignItems: 'center' },
  newIcon: { width: 48, height: 48, borderRadius: RADIUS.lg, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  newTitle: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: COLORS.gray800 },
  newSub: { fontSize: FONT_SIZE.sm, color: COLORS.gray500, marginTop: 2 },
  cHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  cTitle: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: COLORS.gray800 },
  cDate: { fontSize: FONT_SIZE.xs, color: COLORS.gray400, marginTop: 2 },
  cDesc: { fontSize: FONT_SIZE.sm, color: COLORS.gray500, lineHeight: 20, marginBottom: SPACING.sm },
  reponseBox: { backgroundColor: COLORS.successLight, borderRadius: RADIUS.md, padding: SPACING.md, marginTop: SPACING.xs },
  reponseLabel: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, color: COLORS.success, marginBottom: SPACING.xs },
  reponseText: { fontSize: FONT_SIZE.sm, color: COLORS.gray700, lineHeight: 20 },
});
