import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadow, spacing } from '../../../theme/theme';

interface ChatBubbleProps {
  children: string;
}

export function ChatBubble({ children }: ChatBubbleProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.senderRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🔥</Text>
        </View>
        <Text style={styles.senderName}>Flame</Text>
      </View>
      <View style={styles.bubble}>
        <Text style={styles.text}>{children}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    maxWidth: '88%',
    gap: spacing.xs,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: radii.pill,
    backgroundColor: colors.userBubble,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  bubble: {
    backgroundColor: colors.botBubble,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadow,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
  },
});
