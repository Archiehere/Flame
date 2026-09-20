import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../../../theme/theme';

interface CourseProgressRingProps {
  percentComplete: number;
  completedCount: number;
  totalCount: number;
  size?: number;
}

const STROKE_WIDTH = 10;

export function CourseProgressRing({
  percentComplete,
  completedCount,
  totalCount,
  size = 160,
}: CourseProgressRingProps): React.JSX.Element {
  const radius = (size - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percentComplete));
  const dashOffset = circumference * (1 - clamped / 100);
  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.streak} />
            <Stop offset="100%" stopColor={colors.primary} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.border}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          fill="none"
          rotation={-90}
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={styles.labelContainer}>
        <Text style={styles.percentText}>{`${clamped}%`}</Text>
        <Text style={styles.chapterCountText}>{`${completedCount}/${totalCount} chapters`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    gap: 2,
  },
  percentText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  chapterCountText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
