import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors, radii, shadow, spacing } from '../../../theme/theme';

interface ChatComposerProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder: string;
  autoFocus?: boolean;
}

export function ChatComposer({
  value,
  onChangeText,
  onSubmit,
  placeholder,
  autoFocus,
}: ChatComposerProps): React.JSX.Element {
  const canSend = value.trim().length > 0;

  return (
    <View style={styles.row}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        returnKeyType="send"
        autoFocus={autoFocus}
        onSubmitEditing={() => canSend && onSubmit()}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send"
        disabled={!canSend}
        onPress={onSubmit}
        style={({ pressed }) => [
          styles.sendButton,
          !canSend && styles.sendButtonDisabled,
          pressed && canSend && styles.sendButtonPressed,
        ]}
      >
        <View style={styles.sendIcon} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
    color: colors.textPrimary,
    ...shadow,
    shadowOpacity: 0.05,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  sendButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendIcon: {
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: colors.textOnPrimary,
    marginLeft: 3,
  },
});
