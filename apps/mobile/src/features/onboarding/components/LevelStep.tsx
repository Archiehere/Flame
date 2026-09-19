import { StyleSheet, View } from 'react-native';
import { spacing } from '../../../theme/theme';
import { HOBBY_LEVEL_OPTIONS, HobbyLevel } from '../types';
import { ChatBubble } from './ChatBubble';
import { OptionButton } from './OptionButton';

interface LevelStepProps {
  hobby: string;
  onSelect: (level: HobbyLevel) => void;
}

export function LevelStep({ hobby, onSelect }: LevelStepProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <ChatBubble>{`Great choice — ${hobby}! What's your current level?`}</ChatBubble>
      <View style={styles.options}>
        {HOBBY_LEVEL_OPTIONS.map((option) => (
          <OptionButton
            key={option.value}
            label={option.label}
            onPress={() => onSelect(option.value)}
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
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
});
