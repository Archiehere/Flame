import Constants from 'expo-constants';
import { useMemo, useState } from 'react';
import { Alert, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import WebView from 'react-native-webview';
import { colors, spacing } from '../../../theme/theme';

export function buildYouTubeHtml(videoId: string, origin: string): string {
  if (!/^[\w-]{11}$/.test(videoId)) throw new Error('Invalid YouTube video ID');
  const embedUrl = `https://www.youtube.com/embed/${videoId}?playsinline=1&enablejsapi=1&origin=${encodeURIComponent(origin)}`;
  return `<!DOCTYPE html><html><head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    <style>html,body{margin:0;height:100%;background:#000}iframe{width:100%;height:100%;border:0;display:block}</style>
    </head><body>
    <iframe id="player" src="${embedUrl}" referrerpolicy="strict-origin-when-cross-origin"
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
    <script>
      function send(type, code) { window.ReactNativeWebView.postMessage(JSON.stringify({type:type,code:code})); }
      function onYouTubeIframeAPIReady() {
        new YT.Player('player', {events: {onError: function(event) { send('playerError', event.data); }}});
      }
    </script><script src="https://www.youtube.com/iframe_api"></script>
    </body></html>`;
}

function getAppOrigin(): string | null {
  // Expo Go is the installed host app; standalone/dev builds use Flame's ID.
  if (Constants.executionEnvironment === 'storeClient') return 'https://host.exp.exponent';
  const appId = Platform.OS === 'ios'
    ? Constants.expoConfig?.ios?.bundleIdentifier
    : Constants.expoConfig?.android?.package;
  return appId ? `https://${appId.toLowerCase()}` : null;
}

export function YouTubePlayer({ videoId }: { videoId: string }): React.JSX.Element {
  const [error, setError] = useState<string | null>(null);
  const origin = getAppOrigin();
  const source = useMemo(() => {
    if (!origin || !/^[\w-]{11}$/.test(videoId) || Platform.OS === 'web') return null;
    return { html: buildYouTubeHtml(videoId, origin), baseUrl: `${origin}/` };
  }, [videoId, origin]);

  const openYouTube = () => {
    Linking.openURL(`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`).catch(() => {
      Alert.alert('Could not open YouTube', 'Please try again.');
    });
  };

  return (
    <View style={styles.container}>
      {source && !error && (
        <WebView
          testID="youtube-player"
          source={source}
          originWhitelist={['https://*']}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction
          scrollEnabled={false}
          style={styles.player}
          onError={() => setError('The video could not load. Try watching it on YouTube.')}
          onMessage={({ nativeEvent }) => {
            try {
              const message = JSON.parse(nativeEvent.data);
              if (message.type === 'playerError' && typeof message.code === 'number') {
                setError(`This video cannot play here (error ${message.code}). You can open it on YouTube.`);
              }
            } catch { /* Ignore messages unrelated to the player. */ }
          }}
        />
      )}
      {(error || !source) && <Text style={styles.error}>{error ?? 'Open this video on YouTube to watch.'}</Text>}
      <Pressable accessibilityRole="link" accessibilityLabel="Open video in YouTube" onPress={openYouTube} style={styles.link}>
        <Text style={styles.linkText}>Open in YouTube ↗</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  player: { width: '100%', aspectRatio: 16 / 9, minHeight: 200, backgroundColor: '#000000' },
  error: { fontSize: 13, lineHeight: 20, color: colors.textSecondary },
  link: { alignSelf: 'flex-start', paddingVertical: spacing.sm },
  linkText: { fontSize: 13, fontWeight: '600', color: colors.primaryPressed },
});
