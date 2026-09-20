import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing } from '../../../theme/theme';

interface PillButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export function PillButton({ label, onPress, disabled }: PillButtonProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.pillDark,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    color: colors.textOnPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
});
