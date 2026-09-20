import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { colors, spacing } from '../../../theme/theme';

interface StreakPointsChartProps {
  labels: string[];
  points: number[];
  width?: number;
  height?: number;
}

const H_PADDING = 16;
const V_PADDING = 20;

function buildLinePath(coords: { x: number; y: number }[]): string {
  return coords.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

function buildAreaPath(coords: { x: number; y: number }[], baselineY: number): string {
  if (coords.length === 0) {
    return '';
  }
  const line = buildLinePath(coords);
  const last = coords[coords.length - 1];
  const first = coords[0];
  return `${line} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
}

export function StreakPointsChart({
  labels,
  points,
  width = 320,
  height = 140,
}: StreakPointsChartProps): React.JSX.Element {
  const chartWidth = width - H_PADDING * 2;
  const chartHeight = height - V_PADDING * 2;

  const maxValue = Math.max(...points, 1);
  const minValue = Math.min(...points, 0);
  const range = maxValue - minValue || 1;

  const coords = points.map((value, index) => {
    const x = H_PADDING + (points.length === 1 ? chartWidth / 2 : (index / (points.length - 1)) * chartWidth);
    const y = V_PADDING + chartHeight - ((value - minValue) / range) * chartHeight;
    return { x, y };
  });

  const baselineY = V_PADDING + chartHeight;
  const linePath = buildLinePath(coords);
  const areaPath = buildAreaPath(coords, baselineY);

  return (
    <View style={styles.container}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="streakAreaFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={colors.streak} stopOpacity={0.35} />
            <Stop offset="100%" stopColor={colors.streak} stopOpacity={0} />
          </LinearGradient>
          <LinearGradient id="streakLine" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors.primary} />
            <Stop offset="100%" stopColor={colors.streak} />
          </LinearGradient>
        </Defs>

        {areaPath && <Path d={areaPath} fill="url(#streakAreaFill)" />}
        {linePath && (
          <Path
            d={linePath}
            stroke="url(#streakLine)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}

        {coords.map((point, index) => {
          const isLast = index === coords.length - 1;
          return (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={isLast ? 6 : 4}
              fill={isLast ? colors.streak : colors.surface}
              stroke={colors.streak}
              strokeWidth={isLast ? 0 : 2}
            />
          );
        })}
      </Svg>

      <View style={styles.labelRow}>
        {labels.map((label, index) => (
          <Text
            key={index}
            style={[styles.label, index === labels.length - 1 && styles.labelActive]}
          >
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: H_PADDING,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.textPrimary,
    fontWeight: '800',
  },
});
