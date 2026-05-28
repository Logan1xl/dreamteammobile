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
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/useAuthStore';
import { changePassword, logout as logoutApi } from '../../src/api/auth';
import { showErrorAlert } from '../../src/utils/errorUtils';
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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);

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

  const resetPasswordForm = () => {
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswords(false);
  };

  const handleChangePassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Confirmation incorrecte', 'Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    if (!/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(passwordForm.newPassword)) {
      Alert.alert(
        'Mot de passe faible',
        'Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.'
      );
      return;
    }

    setChangingPassword(true);
    try {
      const response = await changePassword(passwordForm);
      if (response.success) {
        setShowPasswordModal(false);
        resetPasswordForm();
        Alert.alert('Mot de passe modifié', 'Votre mot de passe a été mis à jour avec succès.');
      } else {
        Alert.alert('Erreur', response.message || 'Impossible de modifier le mot de passe.');
      }
    } catch (error) {
      showErrorAlert(error, 'Mot de passe');
    } finally {
      setChangingPassword(false);
    }
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
            'chatbubbles-outline',
            'Mes requêtes',
            () => router.push('/requests' as any),
            undefined,
            COLORS.info
          )}

          <View style={styles.separator} />

          {renderMenuItem(
            'lock-closed-outline',
            'Changer le mot de passe',
            () => setShowPasswordModal(true),
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

      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowPasswordModal(false);
          resetPasswordForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}>
                <Ionicons name="lock-closed-outline" size={22} color={COLORS.warning} />
              </View>
              <View style={styles.modalTitleGroup}>
                <Text style={styles.modalTitle}>Changer le mot de passe</Text>
                <Text style={styles.modalSubtitle}>Sécurisez votre compte Dream Team</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowPasswordModal(false);
                  resetPasswordForm();
                }}
                style={styles.modalClose}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={20} color={COLORS.gray500} />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordInputGroup}>
              <Text style={styles.passwordLabel}>Mot de passe actuel</Text>
              <TextInput
                style={styles.passwordInput}
                value={passwordForm.oldPassword}
                onChangeText={(value) => setPasswordForm((prev) => ({ ...prev, oldPassword: value }))}
                secureTextEntry={!showPasswords}
                placeholder="Votre mot de passe actuel"
                placeholderTextColor={COLORS.gray400}
              />
            </View>

            <View style={styles.passwordInputGroup}>
              <Text style={styles.passwordLabel}>Nouveau mot de passe</Text>
              <TextInput
                style={styles.passwordInput}
                value={passwordForm.newPassword}
                onChangeText={(value) => setPasswordForm((prev) => ({ ...prev, newPassword: value }))}
                secureTextEntry={!showPasswords}
                placeholder="8 caractères minimum"
                placeholderTextColor={COLORS.gray400}
              />
            </View>

            <View style={styles.passwordInputGroup}>
              <Text style={styles.passwordLabel}>Confirmation</Text>
              <TextInput
                style={styles.passwordInput}
                value={passwordForm.confirmPassword}
                onChangeText={(value) => setPasswordForm((prev) => ({ ...prev, confirmPassword: value }))}
                secureTextEntry={!showPasswords}
                placeholder="Répétez le nouveau mot de passe"
                placeholderTextColor={COLORS.gray400}
              />
            </View>

            <TouchableOpacity
              style={styles.showPasswordRow}
              onPress={() => setShowPasswords((value) => !value)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={showPasswords ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={COLORS.primary}
              />
              <Text style={styles.showPasswordText}>
                {showPasswords ? 'Masquer les mots de passe' : 'Afficher les mots de passe'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.savePasswordButton, changingPassword && { opacity: 0.7 }]}
              onPress={handleChangePassword}
              disabled={changingPassword}
              activeOpacity={0.85}
            >
              {changingPassword ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.white} />
                  <Text style={styles.savePasswordText}>Mettre à jour</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    ...SHADOWS.heavy,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  modalIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.warningLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitleGroup: { flex: 1 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: COLORS.primaryDeep },
  modalSubtitle: { fontSize: 11, color: COLORS.gray500, marginTop: 2 },
  modalClose: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordInputGroup: { marginBottom: 12 },
  passwordLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.gray500,
    textTransform: 'uppercase',
    marginBottom: 7,
  },
  passwordInput: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    backgroundColor: COLORS.gray50,
    paddingHorizontal: 14,
    color: COLORS.primaryDeep,
    fontSize: 14,
    fontWeight: '600',
  },
  showPasswordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    marginBottom: 12,
  },
  showPasswordText: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  savePasswordButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  savePasswordText: { color: COLORS.white, fontSize: 15, fontWeight: '800' },
});
