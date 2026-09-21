import { fireEvent, render, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { buildYouTubeHtml, YouTubePlayer } from './YouTubePlayer';

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    executionEnvironment: 'standalone',
    expoConfig: { android: { package: 'com.flame.mobile' }, ios: { bundleIdentifier: 'com.flame.mobile' } },
  },
}));
jest.mock('react-native-webview', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: View };
});

afterEach(() => jest.restoreAllMocks());

it('identifies Flame in both the document base URL and iframe origin', () => {
  render(<YouTubePlayer videoId="M7lc1UVf-VE" />);
  const player = screen.getByTestId('youtube-player');
  expect(player.props.source.baseUrl).toBe('https://com.flame.mobile/');
  expect(player.props.source.html).toContain('origin=https%3A%2F%2Fcom.flame.mobile');
  expect(player.props.source.html).toContain('referrerpolicy="strict-origin-when-cross-origin"');
  expect(player.props.userAgent).toBeUndefined();
});

it('shows an external playback fallback for YouTube errors', () => {
  render(<YouTubePlayer videoId="M7lc1UVf-VE" />);
  fireEvent(screen.getByTestId('youtube-player'), 'message', {
    nativeEvent: { data: JSON.stringify({ type: 'playerError', code: 153 }) },
  });
  expect(screen.queryByTestId('youtube-player')).toBeNull();
  expect(screen.getByText(/error 153/)).toBeTruthy();
  expect(screen.getByLabelText('Open video in YouTube')).toBeTruthy();
});

it('offers a fallback when the WebView cannot load', () => {
  render(<YouTubePlayer videoId="M7lc1UVf-VE" />);
  fireEvent(screen.getByTestId('youtube-player'), 'error');
  expect(screen.getByText(/video could not load/)).toBeTruthy();
});

it('opens the actual video in YouTube', () => {
  const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  render(<YouTubePlayer videoId="M7lc1UVf-VE" />);
  fireEvent.press(screen.getByLabelText('Open video in YouTube'));
  expect(open).toHaveBeenCalledWith('https://www.youtube.com/watch?v=M7lc1UVf-VE');
});

it('rejects malformed video IDs before interpolating HTML', () => {
  expect(() => buildYouTubeHtml('<script>bad</script>', 'https://com.flame.mobile')).toThrow();
});
