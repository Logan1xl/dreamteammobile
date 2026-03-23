/**
 * ============================================================
 * GradientButton - Bouton avec dégradé animé
 * Effet de pression avec scale et opacité via Reanimated
 * ============================================================
 */
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS, SPACING } from '../../theme/theme';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'dark' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const GRADIENT_MAP = {
  primary: COLORS.primaryGradient,
  success: COLORS.successGradient,
  warning: COLORS.warningGradient,
  danger: COLORS.dangerGradient,
  dark: COLORS.darkGradient,
  gold: COLORS.goldGradient,
};

const SIZE_MAP = {
  sm: { height: 40, paddingHorizontal: SPACING.md, fontSize: FONT_SIZE.sm },
  md: { height: 52, paddingHorizontal: SPACING.lg, fontSize: FONT_SIZE.md },
  lg: { height: 58, paddingHorizontal: SPACING.xl, fontSize: FONT_SIZE.lg },
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function GradientButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  icon,
  style,
  textStyle,
  fullWidth = true,
}: GradientButtonProps) {
  // Animation de pression
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const sizeConfig = SIZE_MAP[size];
  const isDisabled = disabled || loading;

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      disabled={isDisabled}
      style={[
        animatedStyle,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <LinearGradient
        colors={GRADIENT_MAP[variant] as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          {
            height: sizeConfig.height,
            paddingHorizontal: sizeConfig.paddingHorizontal,
          },
          SHADOWS.glow,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} size="small" />
        ) : (
          <>
            {icon && <>{icon}</>}
            <Text
              style={[
                styles.text,
                { fontSize: sizeConfig.fontSize },
                icon ? { marginLeft: SPACING.sm } : undefined,
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </LinearGradient>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  gradient: {
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 0.5,
  },
});
