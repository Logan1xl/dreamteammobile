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
import {
  UserCircle,
  Mail,
  Phone,
  Shield,
  LogOut,
  ChevronRight,
  Settings,
  HelpCircle,
  FileText,
  Bell,
  Moon,
  Lock,
} from 'lucide-react-native';
import { useAuthStore } from '../../src/store/useAuthStore';
import { logout as logoutApi } from '../../src/api/auth';
import AnimatedCard from '../../src/components/common/AnimatedCard';
import GradientButton from '../../src/components/common/GradientButton';
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
  const isAdmin = useAuthStore((s) => s.isAdmin);

  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  /**
   * Déconnexion avec confirmation
   */
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
              // Continue même si l'appel API échoue
            }
            logoutStore();
            router.replace('/login');
          },
        },
      ]
    );
  };

  /**
   * Rend une ligne de menu avec icône et navigation
   */
  const renderMenuItem = (
    icon: React.ReactNode,
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
        {icon}
        <Text style={[styles.menuItemLabel, color ? { color } : null]}>
          {label}
        </Text>
      </View>
      {right || (onPress && <ChevronRight size={18} color={COLORS.gray400} />)}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header profil avec dégradé */}
      <LinearGradient
        colors={COLORS.primaryGradient as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={[styles.bgCircle, styles.bgCircle1]} />
        <View style={[styles.bgCircle, styles.bgCircle2]} />

        <View style={styles.profileSection}>
          {/* Avatar */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.prenoms?.[0] || 'D'}{user?.nom?.[0] || 'T'}
            </Text>
          </View>

          <Text style={styles.userName}>{fullName()}</Text>

          {/* Rôle */}
          <View style={styles.roleBadge}>
            <Shield size={14} color={COLORS.whiteAlpha(0.9)} />
            <Text style={styles.roleText}>
              {isAdmin() ? 'Administrateur' : 'Membre'}
            </Text>
          </View>

          {/* Matricule */}
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
        {/* Informations personnelles */}
        <AnimatedCard index={0} variant="elevated">
          <Text style={styles.cardTitle}>Informations personnelles</Text>

          <View style={styles.infoRow}>
            <Mail size={18} color={COLORS.gray400} />
            <View style={styles.infoTexts}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || '-'}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Phone size={18} color={COLORS.gray400} />
            <View style={styles.infoTexts}>
              <Text style={styles.infoLabel}>Téléphone</Text>
              <Text style={styles.infoValue}>{user?.telephone || '-'}</Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Menu de paramètres */}
        <AnimatedCard index={1} variant="elevated">
          <Text style={styles.cardTitle}>Paramètres</Text>

          {renderMenuItem(
            <Bell size={20} color={COLORS.primary} />,
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
            <Lock size={20} color={COLORS.warning} />,
            'Changer le mot de passe',
            () => Alert.alert('Info', 'Fonctionnalité à venir')
          )}

          <View style={styles.separator} />

          {renderMenuItem(
            <HelpCircle size={20} color={COLORS.info} />,
            'Aide et support',
            () => Alert.alert('Info', 'Fonctionnalité à venir')
          )}

          <View style={styles.separator} />

          {renderMenuItem(
            <FileText size={20} color={COLORS.gray500} />,
            "Conditions d'utilisation",
            () => Alert.alert('Info', 'Fonctionnalité à venir')
          )}
        </AnimatedCard>

        {/* Bouton de déconnexion */}
        <AnimatedCard index={2} variant="default">
          <TouchableOpacity
            style={styles.logoutRow}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LogOut size={22} color={COLORS.danger} />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </AnimatedCard>

        {/* Version */}
        <Text style={styles.version}>Dream Team v1.0.0</Text>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  // Header
  header: {
    paddingTop: 60,
    paddingBottom: SPACING.xxl + SPACING.md,
    paddingHorizontal: SPACING.lg,
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: COLORS.whiteAlpha(0.06),
  },
  bgCircle1: { width: 250, height: 250, top: -70, right: -80 },
  bgCircle2: { width: 160, height: 160, bottom: -30, left: -50 },
  profileSection: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.whiteAlpha(0.25),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.whiteAlpha(0.4),
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  userName: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.whiteAlpha(0.15),
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  roleText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.whiteAlpha(0.9),
    fontWeight: FONT_WEIGHT.semibold,
  },
  matricule: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.whiteAlpha(0.7),
    marginTop: SPACING.sm,
    letterSpacing: 0.5,
  },
  // Scroll
  scrollView: { flex: 1, marginTop: -SPACING.lg },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  // Cartes
  cardTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray800,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  infoTexts: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  infoLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray400,
  },
  infoValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.gray700,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginVertical: SPACING.xs,
  },
  // Menu items
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  menuItemLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.gray700,
  },
  // Déconnexion
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  logoutText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.danger,
  },
  // Version
  version: {
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray400,
    marginTop: SPACING.lg,
  },
  bottomSpacer: { height: SPACING.xxl },
});
