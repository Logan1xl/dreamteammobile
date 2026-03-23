/**
 * ============================================================
 * Écran 404 - Page Non Trouvée
 * Affichée quand une route n'existe pas
 * ============================================================
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import GradientButton from '../src/components/common/GradientButton';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, RADIUS } from '../src/theme/theme';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <AlertCircle size={48} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>Page introuvable</Text>
      <Text style={styles.description}>
        La page que vous cherchez n'existe pas ou a été déplacée.
      </Text>
      <View style={styles.buttonWrapper}>
        <GradientButton
          title="Retour à l'accueil"
          onPress={() => router.replace('/(tabs)')}
          size="md"
          fullWidth={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray800,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  buttonWrapper: {
    marginTop: SPACING.xl,
  },
});
