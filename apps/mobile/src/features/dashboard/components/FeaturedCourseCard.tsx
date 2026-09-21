import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, shadow, spacing } from '../../../theme/theme';
import { getHobbyIcon } from '../hobbyIcons';

interface FeaturedCourseCardProps {
  title: string;
  hobby: string;
  description: string;
  isAdded: boolean;
  isAdding: boolean;
  isAtLimit?: boolean;
  onAdd: () => void;
  onPreview: () => void;
}

export function FeaturedCourseCard({
  title,
  hobby,
  description,
  isAdded,
  isAdding,
  isAtLimit = false,
  onAdd,
  onPreview,
}: FeaturedCourseCardProps): React.JSX.Element {
  return (
    <View style={styles.card}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Preview ${title}`} onPress={onPreview}>
        <Text style={styles.icon}>{getHobbyIcon(hobby)}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.description} numberOfLines={3}>
          {description}
        </Text>

      </Pressable>

      {isAdded ? (
        <View style={styles.addedBadge}>
          <Text style={styles.addedBadgeText}>✓ In your courses</Text>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Add ${title} to your courses`}
          accessibilityHint={isAtLimit ? "Maximum 5 courses allowed at a time." : undefined}
          disabled={isAdding}
          onPress={onAdd}
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
            isAdding && styles.addButtonDisabled,
            isAtLimit && styles.addButtonLimited,
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
    width: 200,
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
    fontSize: 18,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    paddingVertical: 10,
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
  addButtonLimited: {
    opacity: 0.4,
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
