import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { backgroundGradient, backgroundGradientPoints, colors } from '../theme/theme';

interface AppBackgroundProps {
  children: ReactNode;
  style?: object;
}

const GLOW_SIZE = 420;

/**
 * Shared screen background: a purple linear gradient (right-to-left) with a
 * soft yellow radial glow on the left, rendered as a true SVG radial
 * gradient (React Native's LinearGradient has no radial mode).
 */
export function AppBackground({ children, style }: AppBackgroundProps): React.JSX.Element {
  return (
    <LinearGradient
      colors={backgroundGradient}
      start={backgroundGradientPoints.start}
      end={backgroundGradientPoints.end}
      style={[styles.flex, style]}
    >
      <View pointerEvents="none" style={styles.glowContainer}>
        <Svg width={GLOW_SIZE} height={GLOW_SIZE} viewBox={`0 0 ${GLOW_SIZE} ${GLOW_SIZE}`}>
          <Defs>
            <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={colors.streak} stopOpacity={0.35} />
              <Stop offset="55%" stopColor={colors.streak} stopOpacity={0.16} />
              <Stop offset="100%" stopColor={colors.streak} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={GLOW_SIZE / 2} cy={GLOW_SIZE / 2} r={GLOW_SIZE / 2} fill="url(#glow)" />
        </Svg>
      </View>
      <View style={styles.flex}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  glowContainer: {
    position: 'absolute',
    top: '30%',
    left: -GLOW_SIZE / 2.6,
    width: GLOW_SIZE,
    height: GLOW_SIZE,
  },
});
