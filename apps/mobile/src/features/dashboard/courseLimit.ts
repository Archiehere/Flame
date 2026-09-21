import { Alert } from 'react-native';

export const MAX_COURSES = 5;

export function showCourseLimitAlert(): void {
  Alert.alert('Course limit reached', 'Maximum 5 courses allowed at a time.');
}
