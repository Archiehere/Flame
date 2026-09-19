import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { OnboardingChatScreen } from '../src/features/onboarding/components/OnboardingChatScreen';
import { getActiveLearningPlans } from '../src/services/learningPlanApi';
import { colors } from '../src/theme/theme';

type GateStatus = 'checking' | 'no-active-plan';

export default function HomeRoute(): React.JSX.Element {
  const router = useRouter();
  const [status, setStatus] = useState<GateStatus>('checking');

  useEffect(() => {
    let cancelled = false;

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
          setStatus('no-active-plan');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (status === 'checking') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
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
  },
});
