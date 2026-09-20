import { useEffect, useRef, useState } from 'react';
import { Animated, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { VideoFrameIcon } from '../../../components/VideoFrameIcon';
import { colors, radii, shadow, spacing } from '../../../theme/theme';
import { ChecklistItem } from '../../onboarding/types';
import { StepChecklist } from './StepChecklist';

interface ChecklistItemCardProps {
  item: ChecklistItem;
  onToggle: () => void;
}

function openYoutubeVideo(videoId: string): void {
  Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`);
}

export function ChecklistItemCard({ item, onToggle }: ChecklistItemCardProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const isMastered = item.status === 'mastered';
  const chevronRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(chevronRotation, {
      toValue: expanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [expanded, chevronRotation]);

  const chevronRotate = chevronRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => setExpanded((prev) => !prev)}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <View style={styles.leadingColumn}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityLabel={isMastered ? 'Mark as not done' : 'Mark as done'}
            accessibilityState={{ checked: isMastered }}
            onPress={onToggle}
            hitSlop={8}
            style={[styles.checkbox, isMastered && styles.checkboxDone]}
          >
            {isMastered && <Text style={styles.checkboxMark}>✓</Text>}
          </Pressable>
          {item.youtubeVideoId && (
            <VideoFrameIcon size={18} color={colors.primary} />
          )}
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, isMastered && styles.titleDone]}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
        {item.required && (
          <View style={styles.requiredBadge}>
            <Text style={styles.requiredText}>CORE</Text>
          </View>
        )}
        <Animated.Text
          style={[styles.chevron, { transform: [{ rotate: chevronRotate }] }]}
        >
          ›
        </Animated.Text>
      </View>

      {expanded && (
        <View style={styles.content}>
          {item.youtubeVideoId && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Watch video on YouTube"
              onPress={() => openYoutubeVideo(item.youtubeVideoId ?? '')}
              style={styles.videoContainer}
            >
              <Image
                source={{ uri: `https://img.youtube.com/vi/${item.youtubeVideoId}/hqdefault.jpg` }}
                style={styles.videoThumbnail}
              />
              <View style={styles.playOverlay}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
              <View style={styles.watchBadge}>
                <Text style={styles.watchBadgeText}>Watch on YouTube</Text>
              </View>
            </Pressable>
          )}
          {item.steps && item.steps.length > 0 ? (
            <StepChecklist steps={item.steps} />
          ) : (
            item.textContent && <Text style={styles.textContent}>{item.textContent}</Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
    ...shadow,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  leadingColumn: {
    alignItems: 'center',
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxDone: {
    backgroundColor: colors.primary,
  },
  checkboxMark: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  titleDone: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  requiredBadge: {
    backgroundColor: colors.userBubble,
    borderRadius: radii.pill,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  chevron: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 1,
  },
  content: {
    gap: spacing.md,
  },
  videoContainer: {
    aspectRatio: 16 / 9,
    borderRadius: radii.sm,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  playIcon: {
    fontSize: 32,
    color: colors.surface,
  },
  watchBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: radii.pill,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  watchBadgeText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: '700',
  },
  textContent: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 21,
  },
});
