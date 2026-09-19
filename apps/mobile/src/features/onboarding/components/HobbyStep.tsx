import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../../../theme/theme';
import { ChatBubble } from './ChatBubble';
import { ChatComposer } from './ChatComposer';
import { OptionButton } from './OptionButton';

const SUGGESTED_HOBBIES = ['Guitar', 'Watercolor Painting', 'Creative Writing', 'Chess'];

interface HobbyStepProps {
  name: string;
  isReturningUser: boolean;
  onSelect: (hobby: string) => void;
}

export function HobbyStep({
  name,
  isReturningUser,
  onSelect,
}: HobbyStepProps): React.JSX.Element {
  const [customHobby, setCustomHobby] = useState('');
  const greeting = isReturningUser
    ? `Welcome back, ${name}! What hobby do you want to learn this time?`
    : `Nice to meet you, ${name}! What hobby do you want to learn?`;

  return (
    <View style={styles.container}>
      <ChatBubble>{greeting}</ChatBubble>
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
