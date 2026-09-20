import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../../theme/theme';

interface StepChecklistProps {
  steps: string[];
}

export function StepChecklist({ steps }: StepChecklistProps): React.JSX.Element {
  const [doneSteps, setDoneSteps] = useState<Set<number>>(new Set());

  const toggleStep = (index: number) => {
    setDoneSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const done = doneSteps.has(index);
        return (
          <Pressable
            key={index}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: done }}
            onPress={() => toggleStep(index)}
            style={styles.row}
          >
            <View style={[styles.marker, done && styles.markerDone]}>
              <Text style={[styles.markerText, done && styles.markerTextDone]}>
                {done ? '✓' : index + 1}
              </Text>
            </View>
            <Text style={[styles.stepText, done && styles.stepTextDone]}>{step}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const MARKER_SIZE = 26;

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  marker: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  markerDone: {
    backgroundColor: colors.primary,
  },
  markerText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  markerTextDone: {
    color: colors.textOnPrimary,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 21,
  },
  stepTextDone: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
});
