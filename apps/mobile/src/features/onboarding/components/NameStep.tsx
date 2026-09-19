import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../../../theme/theme';
import { ChatBubble } from './ChatBubble';
import { ChatComposer } from './ChatComposer';

interface NameStepProps {
  onSelect: (name: string) => void;
}

export function NameStep({ onSelect }: NameStepProps): React.JSX.Element {
  const [name, setName] = useState('');

  const submit = () => {
    if (name.trim().length > 0) {
      onSelect(name.trim());
    }
  };

  return (
    <View style={styles.container}>
      <ChatBubble>Hey! I&apos;m Flame 🔥 What should I call you?</ChatBubble>
      <ChatComposer
        value={name}
        onChangeText={setName}
        onSubmit={submit}
        placeholder="Your name"
        autoFocus
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
});
