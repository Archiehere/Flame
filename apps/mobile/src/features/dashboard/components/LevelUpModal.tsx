import { LinearGradient } from 'expo-linear-gradient';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { colors, radii, shadow, spacing } from '../../../theme/theme';
import { PillButton } from './PillButton';

const GLOW_SIZE = 200;

interface LevelUpModalProps {
  visible: boolean;
  onClose: () => void;
}

export function LevelUpModal({ visible, onClose }: LevelUpModalProps): React.JSX.Element {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <LinearGradient
            colors={['#D9CFF7', '#F4F0FF', '#FFFFFF']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View pointerEvents="none" style={styles.glowContainer}>
            <Svg width={GLOW_SIZE} height={GLOW_SIZE} viewBox={`0 0 ${GLOW_SIZE} ${GLOW_SIZE}`}>
              <Defs>
                <RadialGradient id="levelUpGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor={colors.streak} stopOpacity={0.4} />
                  <Stop offset="55%" stopColor={colors.streak} stopOpacity={0.18} />
                  <Stop offset="100%" stopColor={colors.streak} stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Circle
                cx={GLOW_SIZE / 2}
                cy={GLOW_SIZE / 2}
                r={GLOW_SIZE / 2}
                fill="url(#levelUpGlow)"
              />
            </Svg>
          </View>

          <View style={styles.content}>
            <View style={styles.topRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>⚡ Level Up</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={8}
              >
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>

            <Text style={styles.heading}>Congrats!</Text>
            <Text style={styles.subheading}>You have a new streak</Text>

            <View style={styles.streakBadge}>
              <Text style={styles.streakIcon}>⚡</Text>
            </View>

            <Text style={styles.body}>
              Your dedication is paying off. Keep going and reach new streaks.
            </Text>

            <PillButton label="Let's keep learning" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(35, 31, 61, 0.5)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadow,
  },
  glowContainer: {
    position: 'absolute',
    bottom: -GLOW_SIZE / 2.5,
    left: -GLOW_SIZE / 2.5,
    width: GLOW_SIZE,
    height: GLOW_SIZE,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.sm,
    alignItems: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  badge: {
    backgroundColor: colors.userBubble,
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  subheading: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  streakBadge: {
    width: 88,
    height: 88,
    borderRadius: radii.md + 6,
    backgroundColor: colors.streak,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
    ...shadow,
  },
  streakIcon: {
    fontSize: 36,
    color: colors.textOnPrimary,
  },
  body: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
});
