import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing } from '../../../theme/theme';

interface OptionButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export function OptionButton({ label, onPress, disabled }: OptionButtonProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {({ pressed }) => (
        <Text style={[styles.label, pressed && styles.labelPressed]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
  },
  pressed: {
    backgroundColor: colors.primaryPressed,
    borderColor: colors.primaryPressed,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  labelPressed: {
    color: colors.textOnPrimary,
  },
});
