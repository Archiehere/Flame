import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../../../theme/theme';
import { ChatBubble } from './ChatBubble';
import { ChatComposer } from './ChatComposer';
import { OptionButton } from './OptionButton';

const SUGGESTED_HOBBIES = ['Guitar', 'Watercolor Painting', 'Creative Writing', 'Chess'];

interface HobbyStepProps {
  name: string;
  onSelect: (hobby: string) => void;
}

export function HobbyStep({ name, onSelect }: HobbyStepProps): React.JSX.Element {
  const [customHobby, setCustomHobby] = useState('');

  return (
    <View style={styles.container}>
      <ChatBubble>{`Nice to meet you, ${name}! What hobby do you want to learn?`}</ChatBubble>
      <View style={styles.options}>
        {SUGGESTED_HOBBIES.map((hobby) => (
          <OptionButton key={hobby} label={hobby} onPress={() => onSelect(hobby)} />
        ))}
      </View>
      <ChatComposer
        value={customHobby}
        onChangeText={setCustomHobby}
        onSubmit={() => onSelect(customHobby.trim())}
        placeholder="Or type your own..."
      />
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
