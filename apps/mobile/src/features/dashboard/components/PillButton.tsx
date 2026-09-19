import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing } from '../../../theme/theme';

interface PillButtonProps {
  label: string;
  onPress: () => void;
}

export function PillButton({ label, onPress }: PillButtonProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
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
  label: {
    color: colors.textOnPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
});
