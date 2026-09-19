import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../../theme/theme';
import { useOnboardingFlow } from '../hooks/useOnboardingFlow';
import { HOBBY_LEVEL_OPTIONS } from '../types';
import { ChatBubble } from './ChatBubble';
import { HobbyStep } from './HobbyStep';
import { LevelStep } from './LevelStep';
import { NameStep } from './NameStep';
import { OptionButton } from './OptionButton';
import { SyllabusReview } from './SyllabusReview';
import { TargetDateStep } from './TargetDateStep';
import { UserAnswerBubble } from './UserAnswerBubble';

export function OnboardingChatScreen(): React.JSX.Element {
  const {
    step,
    name,
    hobby,
    level,
    targetDateLabel,
    plan,
    errorMessage,
    isApproving,
    selectName,
    selectHobby,
    selectLevel,
    selectTargetDate,
    retryGeneratePlan,
    reviseChapters,
    submitAndApprove,
    reset,
  } = useOnboardingFlow();

  const scrollRef = useRef<ScrollView>(null);
  const levelLabel = HOBBY_LEVEL_OPTIONS.find((o) => o.value === level)?.label;

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [step]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.brandRow}>
        <View style={styles.brandAvatar}>
          <Text style={styles.brandAvatarText}>🔥</Text>
        </View>
        <View>
          <Text style={styles.brandName}>Flame</Text>
          <Text style={styles.brandSubtitle}>Your learning companion</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.todayPillRow}>
            <Text style={styles.todayPill}>Today</Text>
          </View>

          {name !== '' && (
            <>
              <ChatBubble>Hey! I&apos;m Flame 🔥 What should I call you?</ChatBubble>
              <UserAnswerBubble name={name}>{name}</UserAnswerBubble>
            </>
          )}

          {hobby !== '' && (
            <>
              <ChatBubble>{`Nice to meet you, ${name}! What hobby do you want to learn?`}</ChatBubble>
              <UserAnswerBubble name={name}>{hobby}</UserAnswerBubble>
            </>
          )}

          {levelLabel && (
            <>
              <ChatBubble>{`Great choice — ${hobby}! What's your current level?`}</ChatBubble>
              <UserAnswerBubble name={name}>{levelLabel}</UserAnswerBubble>
            </>
          )}

          {targetDateLabel && (
            <>
              <ChatBubble>When do you want to reach a good working level by?</ChatBubble>
              <UserAnswerBubble name={name}>{targetDateLabel}</UserAnswerBubble>
            </>
          )}

          {step === 'name' && <NameStep onSelect={selectName} />}
          {step === 'hobby' && <HobbyStep name={name} onSelect={selectHobby} />}
          {step === 'level' && <LevelStep hobby={hobby} onSelect={selectLevel} />}
          {step === 'target-date' && <TargetDateStep onSelect={selectTargetDate} />}

          {step === 'generating' && (
            <View style={styles.inlineRow}>
              <ChatBubble>Building your personalized plan...</ChatBubble>
              <ActivityIndicator color={colors.primary} style={styles.spinner} />
            </View>
          )}

          {step === 'syllabus' && plan && (
            <SyllabusReview
              initialChapters={plan.chapters.map(
                ({ title, description, order, timeEstimateDays }) => ({
                  title,
                  description,
                  order,
                  timeEstimateDays,
                }),
              )}
              onApprove={submitAndApprove}
              onRevise={reviseChapters}
              isApproving={isApproving}
              errorMessage={errorMessage}
              userName={name}
            />
          )}

          {step === 'approved' && (
            <ChatBubble>{`Your flame is lit, ${name}! Let's get started.`}</ChatBubble>
          )}

          {step === 'error' && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
              <OptionButton label="Retry" onPress={retryGeneratePlan} />
              <Pressable accessibilityRole="button" onPress={reset} hitSlop={8}>
                <Text style={styles.startOverText}>Start over instead</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  brandAvatar: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandAvatarText: {
    fontSize: 18,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  brandSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
    gap: spacing.md,
  },
  todayPillRow: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  todayPill: {
    backgroundColor: colors.surface,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  inlineRow: {
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  spinner: {
    marginLeft: spacing.xs,
  },
  errorContainer: {
    gap: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: 15,
  },
  startOverText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
