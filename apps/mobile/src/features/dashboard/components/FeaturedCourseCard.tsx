import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadow, spacing } from '../../../theme/theme';
import { getHobbyIcon } from '../hobbyIcons';

interface FeaturedCourseCardProps {
  title: string;
  hobby: string;
  description: string;
  isAdded: boolean;
  isAdding: boolean;
  onAdd: () => void;
}

export function FeaturedCourseCard({
  title,
  hobby,
  description,
  isAdded,
  isAdding,
  onAdd,
}: FeaturedCourseCardProps): React.JSX.Element {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>{getHobbyIcon(hobby)}</Text>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.description} numberOfLines={3}>
        {description}
      </Text>

      {isAdded ? (
        <View style={styles.addedBadge}>
          <Text style={styles.addedBadgeText}>✓ In your courses</Text>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Add ${title} to your courses`}
          disabled={isAdding}
          onPress={onAdd}
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
            isAdding && styles.addButtonDisabled,
          ]}
        >
          {isAdding ? (
            <ActivityIndicator size="small" color={colors.textOnPrimary} />
          ) : (
            <Text style={styles.addButtonText}>+ Add</Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 190,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
    ...shadow,
  },
  icon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    minHeight: 51,
  },
  addButton: {
    marginTop: spacing.xs,
    height: 34,
    borderRadius: radii.pill,
    backgroundColor: colors.pillDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonPressed: {
    opacity: 0.85,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: colors.textOnPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  addedBadge: {
    marginTop: spacing.xs,
    height: 34,
    borderRadius: radii.pill,
    backgroundColor: colors.userBubble,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addedBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});
