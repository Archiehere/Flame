import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radii, spacing } from '../../../theme/theme';
import { HOBBY_LEVEL_OPTIONS } from '../../onboarding/types';
import { FeaturedCourse } from '../featuredCourses';
import { getHobbyIcon } from '../hobbyIcons';

interface Props {
  course: FeaturedCourse;
  isAdded: boolean;
  isAdding: boolean;
  isAtLimit: boolean;
  onClose: () => void;
  onAdd: () => void;
}

export function FeaturedCoursePreview({ course, isAdded, isAdding, isAtLimit, onClose, onAdd }: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const level = HOBBY_LEVEL_OPTIONS.find((option) => option.value === course.level)?.label;

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Dismiss course preview" />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]} accessibilityViewIsModal>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>COURSE PREVIEW</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close course preview" hitSlop={8} style={styles.close}>
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content} bounces={false}>
            <View style={styles.iconTile}><Text style={styles.icon}>{getHobbyIcon(course.hobby)}</Text></View>
            <Text accessibilityRole="header" style={styles.title}>{course.title}</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{level} · At your pace</Text></View>
            <Text style={styles.description}>{course.description}</Text>
            <View style={styles.details}>
              <Text style={styles.detailsTitle}>Your learning journey</Text>
              <Text style={styles.detail}>01   Follow a chapter-by-chapter plan</Text>
              <Text style={styles.detail}>02   Practice with guided checklists</Text>
              <Text style={styles.detail}>03   Track your progress as you learn</Text>
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isAdded ? 'Already in your courses' : `Add ${course.title} from preview`}
              accessibilityState={{ disabled: isAdded || isAdding, busy: isAdding }}
              accessibilityHint={isAtLimit && !isAdded ? 'Maximum 5 courses allowed at a time.' : undefined}
              disabled={isAdded || isAdding}
              onPress={onAdd}
              style={({ pressed }) => [styles.addButton, (pressed || isAdding) && styles.pressed, (isAtLimit || isAdded) && styles.limited]}
            >
              {isAdding ? <ActivityIndicator color={colors.textOnPrimary} /> : <Text style={styles.addText}>{isAdded ? '✓ In your courses' : '+ Add course'}</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(35, 31, 61, 0.2)' },
  sheet: { maxHeight: '85%', backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl },
  eyebrow: { fontFamily: fonts.semiBold, fontSize: 11, letterSpacing: 1.5, color: colors.textSecondary },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 28, color: colors.textSecondary },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.md },
  iconTile: { width: 76, height: 76, backgroundColor: colors.userBubble, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 40 },
  title: { fontFamily: fonts.semiBold, fontSize: 28, color: colors.textPrimary },
  badge: { alignSelf: 'flex-start', backgroundColor: colors.background, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.pill },
  badgeText: { fontFamily: fonts.medium, fontSize: 12, color: colors.primaryPressed },
  description: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 24, color: colors.textSecondary },
  details: { backgroundColor: colors.background, borderRadius: radii.md, padding: spacing.lg, gap: spacing.md, marginTop: spacing.sm },
  detailsTitle: { fontFamily: fonts.medium, fontSize: 16, color: colors.textPrimary },
  detail: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 21, color: colors.textSecondary },
  footer: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.lg, paddingHorizontal: spacing.xl },
  addButton: { minHeight: 52, padding: spacing.md, borderRadius: radii.pill, backgroundColor: colors.pillDark, alignItems: 'center', justifyContent: 'center' },
  limited: { opacity: 0.4 },
  pressed: { opacity: 0.7 },
  addText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.textOnPrimary },
});
