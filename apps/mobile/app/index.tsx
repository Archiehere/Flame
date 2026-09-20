import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { OnboardingChatScreen } from '../src/features/onboarding/components/OnboardingChatScreen';
import { getActiveLearningPlans } from '../src/services/learningPlanApi';
import { colors, spacing } from '../src/theme/theme';

type GateStatus = 'checking' | 'no-active-plan' | 'error';

export default function HomeRoute(): React.JSX.Element {
  const router = useRouter();
  const [status, setStatus] = useState<GateStatus>('checking');

  const checkForActivePlan = useCallback(() => {
    let cancelled = false;
    setStatus('checking');

    getActiveLearningPlans()
      .then((plans) => {
        if (cancelled) {
          return;
        }
        if (plans.length > 0) {
          router.replace('/dashboard');
        } else {
          setStatus('no-active-plan');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => checkForActivePlan(), [checkForActivePlan]);

  if (status === 'checking') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Couldn't reach Flame. Check your connection.</Text>
        <Pressable accessibilityRole="button" onPress={checkForActivePlan}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return <OnboardingChatScreen />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
  retryText: {
    color: colors.primary,
    fontWeight: '700',
  },
});
