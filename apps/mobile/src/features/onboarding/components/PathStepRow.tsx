import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TrashIcon } from '../../../components/TrashIcon';
import { colors, radii, spacing } from '../../../theme/theme';
import { ChapterInput } from '../types';

interface PathStepRowProps {
  chapter: ChapterInput;
  isCurrent: boolean;
  isLast: boolean;
  removable: boolean;
  onRemove: () => void;
}

export function PathStepRow({
  chapter,
  isCurrent,
  isLast,
  removable,
  onRemove,
}: PathStepRowProps): React.JSX.Element {
  return (
    <View style={styles.row}>
      <View style={styles.indicatorColumn}>
        <View style={[styles.indicator, isCurrent && styles.indicatorCurrent]}>
          {isCurrent && <View style={styles.indicatorDot} />}
        </View>
        {!isLast && <View style={styles.connector} />}
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{chapter.title}</Text>
        {isCurrent && <Text style={styles.currentLabel}>CURRENT STEP</Text>}
      </View>

      <View style={styles.actions}>
        {removable && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Delete chapter"
            onPress={onRemove}
            hitSlop={8}
            style={styles.actionButton}
          >
            <TrashIcon size={16} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const INDICATOR_SIZE = 22;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
  },
  indicatorColumn: {
    width: INDICATOR_SIZE,
    alignItems: 'center',
  },
  indicator: {
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorCurrent: {
    borderColor: colors.primary,
  },
  indicatorDot: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  connector: {
    flex: 1,
    width: 2,
    minHeight: 24,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    gap: spacing.xs / 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  currentLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'flex-start',
  },
  actionButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
