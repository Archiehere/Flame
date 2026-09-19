import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../../theme/theme';

interface UserAnswerBubbleProps {
  children: string;
  name?: string;
}

export function UserAnswerBubble({ children, name }: UserAnswerBubbleProps): React.JSX.Element {
  const initial = name?.trim().charAt(0).toUpperCase() ?? 'Y';

  return (
    <View style={styles.container}>
      <View style={styles.senderRow}>
        <Text style={styles.senderName}>You</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
      </View>
      <View style={styles.bubble}>
        <Text style={styles.text}>{children}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-end',
    maxWidth: '88%',
    gap: spacing.xs,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  bubble: {
    backgroundColor: colors.userBubble,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
    fontWeight: '500',
  },
});
