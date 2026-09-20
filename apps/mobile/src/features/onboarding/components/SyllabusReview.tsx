import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadow, spacing } from '../../../theme/theme';
import { ChapterInput } from '../types';
import { ChatBubble } from './ChatBubble';
import { ChatComposer } from './ChatComposer';
import { OptionButton } from './OptionButton';
import { PathStepRow } from './PathStepRow';
import { UserAnswerBubble } from './UserAnswerBubble';

interface SyllabusReviewProps {
  initialChapters: ChapterInput[];
  onApprove: (chapters: ChapterInput[]) => void;
  onRevise: (instruction: string) => Promise<ChapterInput[]>;
  isApproving: boolean;
  errorMessage: string | null;
  userName: string;
}

export function SyllabusReview({
  initialChapters,
  onApprove,
  onRevise,
  isApproving,
  errorMessage,
  userName,
}: SyllabusReviewProps): React.JSX.Element {
  const [chapters, setChapters] = useState(initialChapters);
  const [revisionLog, setRevisionLog] = useState<string[]>([]);
  const [reviseText, setReviseText] = useState('');
  const [isRevising, setIsRevising] = useState(false);
  const [reviseError, setReviseError] = useState<string | null>(null);

  const removeChapter = (index: number) => {
    setChapters((prev) =>
      prev.filter((_, i) => i !== index).map((c, i) => ({ ...c, order: i })),
    );
  };

  const submitRevision = async () => {
    const instruction = reviseText.trim();
    if (!instruction || isRevising) {
      return;
    }

    setIsRevising(true);
    setReviseError(null);
    setRevisionLog((prev) => [...prev, instruction]);
    setReviseText('');

    try {
      const revised = await onRevise(instruction);
      setChapters(revised);
    } catch {
      setReviseError("Couldn't apply that change. Please try again.");
    } finally {
      setIsRevising(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🔗</Text>
          <Text style={styles.headerTitle}>Your path</Text>
        </View>
        <View style={styles.divider} />

        {chapters.map((chapter, index) => (
          <PathStepRow
            key={index}
            chapter={chapter}
            isCurrent={index === 0}
            isLast={index === chapters.length - 1}
            removable={chapters.length > 1}
            onRemove={() => removeChapter(index)}
          />
        ))}
      </View>

      <ChatBubble>{`Do you want to change anything, ${userName}?`}</ChatBubble>

      {revisionLog.map((instruction, index) => (
        <UserAnswerBubble key={index} name={userName}>
          {instruction}
        </UserAnswerBubble>
      ))}

      {isRevising && <ActivityIndicator color={colors.primary} style={styles.reviseSpinner} />}
      {reviseError && <Text style={styles.error}>{reviseError}</Text>}

      <ChatComposer
        value={reviseText}
        onChangeText={setReviseText}
        onSubmit={submitRevision}
        placeholder="e.g. Add a chapter about music theory"
      />

      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
      {isApproving ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <OptionButton label="Approve plan" onPress={() => onApprove(chapters)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerIcon: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  reviseSpinner: {
    alignSelf: 'flex-start',
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
});
