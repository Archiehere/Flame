import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../../theme/theme';

interface AddCourseCardProps {
  onPress: () => void;
}

export function AddCourseCard({ onPress }: AddCourseCardProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Start a new course"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.plusCircle}>
        <Text style={styles.plusText}>+</Text>
      </View>
      <Text style={styles.label}>New course</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 170,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 150,
  },
  pressed: {
    backgroundColor: colors.userBubble,
  },
  plusCircle: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.userBubble,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
