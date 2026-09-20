import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, spacing } from '../../../theme/theme';
import { buildMonthCalendar, getMonthGrid, getMonthLabel } from '../weekDays';

interface MonthCalendarProps {
  currentStreak: number;
  today?: Date;
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function MonthCalendar({
  currentStreak,
  today = new Date(),
}: MonthCalendarProps): React.JSX.Element {
  const [monthOffset, setMonthOffset] = useState(0);

  const current = buildMonthCalendar(currentStreak, today);
  const isCurrentMonth = monthOffset === 0;

  const displayedYear = current.year + Math.floor((current.month + monthOffset) / 12);
  const displayedMonth = (((current.month + monthOffset) % 12) + 12) % 12;
  const { daysInMonth, startWeekday } = isCurrentMonth
    ? current
    : getMonthGrid(displayedYear, displayedMonth);
  const monthLabel = isCurrentMonth ? current.monthLabel : getMonthLabel(displayedMonth);

  const cells: (number | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.headerLabel}>
          <Text style={styles.monthText}>{monthLabel}</Text>
          <Text style={styles.yearText}>{displayedYear}</Text>
        </View>
        <View style={styles.navButtons}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            onPress={() => setMonthOffset((prev) => prev - 1)}
            hitSlop={8}
            style={styles.navButton}
          >
            <Text style={styles.navIcon}>‹</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next month"
            onPress={() => setMonthOffset((prev) => prev + 1)}
            hitSlop={8}
            style={styles.navButton}
          >
            <Text style={styles.navIcon}>›</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label) => (
          <Text key={label} style={styles.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((date, index) => {
          if (date === null) {
            return <View key={index} style={styles.cell} />;
          }

          const isToday = isCurrentMonth && date === current.todayDate;
          const isFilled = isCurrentMonth && current.filledDates.has(date);

          return (
            <View key={index} style={styles.cell}>
              <View
                style={[
                  styles.bubble,
                  isFilled && styles.bubbleFilled,
                  isToday && styles.bubbleToday,
                ]}
              >
                <Text
                  style={[
                    styles.dateText,
                    (isFilled || isToday) && styles.dateTextOnColor,
                  ]}
                >
                  {date}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const CELL_SIZE = '14.28%';
const BUBBLE_SIZE = 40;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerLabel: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  monthText: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  yearText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  navButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekdayLabel: {
    width: CELL_SIZE,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: CELL_SIZE,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleFilled: {
    backgroundColor: colors.primary,
  },
  bubbleToday: {
    backgroundColor: colors.textPrimary,
  },
  dateText: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
  },
  dateTextOnColor: {
    color: colors.textOnPrimary,
    fontFamily: fonts.semiBold,
  },
});
