import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../../theme/theme';

interface ProfileHeaderProps {
  name: string;
  levelLabel: string;
}

export function ProfileHeader({ name, levelLabel }: ProfileHeaderProps): React.JSX.Element {
  const initial = name.trim().charAt(0).toUpperCase() || '🔥';

  return (
    <View style={styles.row}>
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.dot}>{' · '}</Text>
            <Text style={styles.level}>{levelLabel}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Rewards"
          style={styles.iconButton}
          onPress={() => Alert.alert('Coming soon', 'Rewards are on the way!')}
        >
          <Text style={styles.iconText}>👑</Text>
        </Pressable>
      </View>
    </View>
  );
}

const AVATAR_SIZE = 48;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radii.pill,
    backgroundColor: colors.userBubble,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dot: {
    color: colors.textSecondary,
  },
  level: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressTrack: {
    marginTop: spacing.xs,
    width: 140,
    height: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    width: '20%',
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.streak,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 16,
  },
});
