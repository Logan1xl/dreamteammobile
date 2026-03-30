/**
 * ============================================================
 * Écran Profil - Dream Team Mobile
 * Affiche les informations personnelles, permet la modification
 * du profil et la déconnexion
 * ============================================================
 */
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/useAuthStore';
import { logout as logoutApi } from '../../src/api/auth';
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOWS,
} from '../../src/theme/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const fullName = useAuthStore((s) => s.fullName);
  const logoutStore = useAuthStore((s) => s.logout);
  const isAdminFunc = useAuthStore((s) => s.isAdmin);

  const isAdminValue = isAdminFunc();
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutApi();
            } catch (e) {
              // Ignore failure
            }
            logoutStore();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const renderMenuItem = (
    iconName: string,
    label: string,
    onPress?: () => void,
    right?: React.ReactNode,
    color?: string
  ) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons name={iconName as any} size={20} color={color || COLORS.primary} />
        <Text style={[styles.menuItemLabel, color ? { color } : null]}>
          {label}
        </Text>
      </View>
      {right || (onPress && <Ionicons name="chevron-forward" size={18} color={COLORS.gray400} />)}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.primaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.prenoms?.[0] || 'D'}{user?.nom?.[0] || 'T'}
            </Text>
          </View>

          <Text style={styles.userName}>{fullName()}</Text>

          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark" size={14} color={COLORS.white} />
            <Text style={styles.roleText}>
              {isAdminValue ? 'Administrateur' : 'Membre'}
            </Text>
          </View>

          {user?.memberMatricule && (
            <Text style={styles.matricule}>
              Matricule : {user.memberMatricule}
            </Text>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informations personnelles</Text>

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color={COLORS.gray400} />
            <View style={styles.infoTexts}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || '-'}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color={COLORS.gray400} />
            <View style={styles.infoTexts}>
              <Text style={styles.infoLabel}>Téléphone</Text>
              <Text style={styles.infoValue}>{user?.telephone || '-'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Paramètres</Text>

          {renderMenuItem(
            'notifications-outline',
            'Notifications',
            undefined,
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: COLORS.gray200, true: COLORS.primarySoft }}
              thumbColor={notifications ? COLORS.primary : COLORS.gray400}
            />
          )}

          <View style={styles.separator} />

          {renderMenuItem(
            'lock-closed-outline',
            'Changer le mot de passe',
            () => Alert.alert('Info', 'Fonctionnalité à venir'),
            undefined,
            COLORS.warning
          )}

          <View style={styles.separator} />

          {renderMenuItem(
            'help-circle-outline',
            'Aide et support',
            () => Alert.alert('Info', 'Fonctionnalité à venir'),
            undefined,
            COLORS.info
          )}
        </View>

        <View style={[styles.card, { paddingVertical: 10 }]}>
          <TouchableOpacity
            style={styles.logoutRow}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={22} color={COLORS.danger} />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Dream Team v1.0.0</Text>
        <View style={{ height: 100 }} />
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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileSection: { alignItems: 'center' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    marginBottom: 10,
  },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  userName: { fontSize: 22, fontWeight: 'bold', color: 'white', marginBottom: 5 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  roleText: { fontSize: 12, color: 'white', fontWeight: '600' },
  matricule: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 8 },
  scrollView: { flex: 1, marginTop: -20 },
  scrollContent: { paddingHorizontal: 20 },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    ...SHADOWS.soft,
  },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.gray800, marginBottom: 15 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  infoTexts: { marginLeft: 15, flex: 1 },
  infoLabel: { fontSize: 10, color: COLORS.gray400 },
  infoValue: { fontSize: 14, fontWeight: '600', color: COLORS.gray700, marginTop: 2 },
  separator: { height: 1, backgroundColor: COLORS.gray100, marginVertical: 5 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  menuItemLabel: { fontSize: 14, fontWeight: '500', color: COLORS.gray700 },
  logoutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 10 },
  logoutText: { fontSize: 16, fontWeight: 'bold', color: COLORS.danger },
  version: { textAlign: 'center', fontSize: 10, color: COLORS.gray400, marginTop: 10 },
});
