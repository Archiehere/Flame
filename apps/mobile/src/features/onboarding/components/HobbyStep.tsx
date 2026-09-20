import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { extractHobby } from '../../../services/learningPlanApi';
import { colors, spacing } from '../../../theme/theme';
import { ChatBubble } from './ChatBubble';
import { ChatComposer } from './ChatComposer';
import { OptionButton } from './OptionButton';

const SUGGESTED_HOBBIES = ['Guitar', 'Watercolor Painting', 'Creative Writing', 'Chess'];

interface HobbyStepProps {
  name: string;
  isReturningUser: boolean;
  onSelect: (hobby: string, notes?: string, rawMessage?: string) => void;
}

export function HobbyStep({
  name,
  isReturningUser,
  onSelect,
}: HobbyStepProps): React.JSX.Element {
  const [customHobby, setCustomHobby] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const greeting = isReturningUser
    ? `Welcome back, ${name}! What hobby do you want to learn this time?`
    : `Nice to meet you, ${name}! What hobby do you want to learn?`;

  const submitCustomHobby = async () => {
    const message = customHobby.trim();
    if (!message || isExtracting) {
      return;
    }

    setIsExtracting(true);
    try {
      const { hobby, notes } = await extractHobby(message);
      onSelect(hobby, notes, message);
    } catch {
      // Extraction is a nicety, not a blocker — fall back to the raw text
      // so onboarding never gets stuck on a network hiccup.
      onSelect(message);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ChatBubble>{greeting}</ChatBubble>
      <View style={styles.options}>
        {SUGGESTED_HOBBIES.map((hobby) => (
          <OptionButton key={hobby} label={hobby} onPress={() => onSelect(hobby)} />
        ))}
      </View>
      {isExtracting ? (
        <ActivityIndicator color={colors.primary} style={styles.spinner} />
      ) : (
        <ChatComposer
          value={customHobby}
          onChangeText={setCustomHobby}
          onSubmit={submitCustomHobby}
          placeholder="Or type your own..."
        />
      )}
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
  spinner: {
    alignSelf: 'flex-start',
  },
});
