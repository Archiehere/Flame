import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import WebView from 'react-native-webview';
import { colors, radii, shadow, spacing } from '../../../theme/theme';
import { ChecklistItem } from '../../onboarding/types';

interface ChecklistItemCardProps {
  item: ChecklistItem;
}

const MODALITY_ICON: Record<ChecklistItem['modality'], string> = {
  text: '📄',
  video: '🎥',
  both: '📄🎥',
};

function buildYoutubeEmbedHtml(videoId: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
        <style>
          html, body { margin: 0; padding: 0; background: #000; height: 100%; overflow: hidden; }
          iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
        </style>
      </head>
      <body>
        <iframe
          src="https://www.youtube.com/embed/${videoId}?playsinline=1&modestbranding=1&rel=0"
          frameborder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </body>
    </html>
  `;
}

export function ChecklistItemCard({ item }: ChecklistItemCardProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => setExpanded((prev) => !prev)}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <Text style={styles.icon}>{MODALITY_ICON[item.modality]}</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
        {item.required && (
          <View style={styles.requiredBadge}>
            <Text style={styles.requiredText}>CORE</Text>
          </View>
        )}
      </View>

      {expanded && (
        <View style={styles.content}>
          {item.youtubeVideoId && (
            <View style={styles.videoContainer}>
              <WebView
                source={{
                  html: buildYoutubeEmbedHtml(item.youtubeVideoId),
                  baseUrl: 'https://www.youtube.com',
                }}
                originWhitelist={['*']}
                javaScriptEnabled
                domStorageEnabled
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                allowsFullscreenVideo
                thirdPartyCookiesEnabled
                sharedCookiesEnabled
                userAgent="Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
                style={styles.video}
              />
            </View>
          )}
          {item.textContent && <Text style={styles.textContent}>{item.textContent}</Text>}
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
  icon: {
    fontSize: 18,
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
  content: {
    gap: spacing.md,
  },
  videoContainer: {
    aspectRatio: 16 / 9,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  video: {
    flex: 1,
  },
  textContent: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 21,
  },
});
