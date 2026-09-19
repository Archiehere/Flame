import { StyleSheet, View } from 'react-native';
import { spacing } from '../../../theme/theme';
import { TARGET_DATE_PRESETS } from '../types';
import { ChatBubble } from './ChatBubble';
import { OptionButton } from './OptionButton';

interface TargetDateStepProps {
  onSelect: (targetDateIso: string, label: string) => void;
}

export function TargetDateStep({ onSelect }: TargetDateStepProps): React.JSX.Element {
  const handleSelect = (days: number, label: string) => {
    const targetDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    onSelect(targetDate.toISOString(), label);
  };

  return (
    <View style={styles.container}>
      <ChatBubble>When do you want to reach a good working level by?</ChatBubble>
      <View style={styles.options}>
        {TARGET_DATE_PRESETS.map((preset) => (
          <OptionButton
            key={preset.label}
            label={preset.label}
            onPress={() => handleSelect(preset.days, preset.label)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
