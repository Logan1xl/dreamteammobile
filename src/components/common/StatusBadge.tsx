/**
 * ============================================================
 * StatusBadge - Badge de statut coloré
 * Affiche un badge avec couleur adaptée au statut
 * ============================================================
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../../theme/theme';

/** Mapping des statuts vers couleurs et labels */
const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  // Paiements
  PENDING: { bg: COLORS.warningLight, text: COLORS.warning, label: 'En attente' },
  VALIDATED: { bg: COLORS.successLight, text: COLORS.success, label: 'Validé' },
  REJECTED: { bg: COLORS.dangerLight, text: COLORS.danger, label: 'Rejeté' },
  CANCELLED: { bg: COLORS.gray200, text: COLORS.gray600, label: 'Annulé' },

  // Membres
  ACTIVE: { bg: COLORS.successLight, text: COLORS.success, label: 'Actif' },
  SUSPENDED: { bg: COLORS.dangerLight, text: COLORS.danger, label: 'Suspendu' },
  INACTIVE: { bg: COLORS.gray200, text: COLORS.gray600, label: 'Inactif' },
  EXCLUDED: { bg: COLORS.dangerLight, text: COLORS.danger, label: 'Exclu' },

  // Requêtes
  IN_PROGRESS: { bg: COLORS.infoLight, text: COLORS.info, label: 'En cours' },
  RESOLVED: { bg: COLORS.successLight, text: COLORS.success, label: 'Résolu' },
  CLOSED: { bg: COLORS.gray200, text: COLORS.gray600, label: 'Clôturé' },
};

interface StatusBadgeProps {
  status: string;
  customLabel?: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, customLabel, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    bg: COLORS.gray200,
    text: COLORS.gray600,
    label: status,
  };

  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        isSm && styles.badgeSm,
      ]}
    >
      {/* Point indicateur coloré */}
      <View style={[styles.dot, { backgroundColor: config.text }]} />
      <Text
        style={[
          styles.text,
          { color: config.text },
          isSm && styles.textSm,
        ]}
      >
        {customLabel || config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SPACING.xs + 2,
  },
  text: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },
  textSm: {
    fontSize: FONT_SIZE.xs,
  },
});
