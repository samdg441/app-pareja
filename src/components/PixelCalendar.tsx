import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { PIXEL_BORDER_WIDTH } from '../theme/colors';

interface PixelCalendarProps {
  completedDates: string[]; // Array of ISO date strings (YYYY-MM-DD)
  selectedTaskColor?: string;
  month?: number; // 0-11
  year?: number;
}

export const PixelCalendar: React.FC<PixelCalendarProps> = ({
  completedDates,
  selectedTaskColor,
  month = new Date().getMonth(),
  year = new Date().getFullYear(),
}) => {
  const { theme } = useTheme();

  // Get days in month
  const getDaysInMonth = (m: number, y: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  // Get first day of month (0-6, 0 = Sunday)
  const getFirstDayOfMonth = (m: number, y: number) => {
    return new Date(y, m, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);

  // Generate calendar grid (7 columns x 5 rows = 35 cells)
  const renderGrid = () => {
    const cells = [];
    
    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      cells.push(
        <View
          key={`empty-${i}`}
          style={[
            styles.cell,
            {
              backgroundColor: theme.background,
              borderColor: theme.border,
            },
          ]}
        />
      );
    }

    // Actual day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isCompleted = completedDates.includes(dateStr);

      cells.push(
        <View
          key={`day-${day}`}
          style={[
            styles.cell,
            {
              backgroundColor: isCompleted 
                ? (selectedTaskColor || theme.primaryMedium)
                : theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <Text
            style={[
              styles.dayText,
              {
                color: isCompleted ? theme.background : theme.text,
              },
            ]}
          >
            {day}
          </Text>
        </View>
      );
    }

    // Fill remaining cells to complete the grid (35 total)
    const remainingCells = 35 - cells.length;
    for (let i = 0; i < remainingCells; i++) {
      cells.push(
        <View
          key={`empty-end-${i}`}
          style={[
            styles.cell,
            {
              backgroundColor: theme.background,
              borderColor: theme.border,
            },
          ]}
        />
      );
    }

    return cells;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.monthTitle,
          { color: theme.text },
        ]}
      >
        {monthNames[month]} {year}
      </Text>
      <View style={styles.weekHeader}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <Text
            key={index}
            style={[
              styles.weekDayText,
              { color: theme.textMuted },
            ]}
          >
            {day}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {renderGrid()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  monthTitle: {
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayText: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    width: 32,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  cell: {
    width: 36,
    height: 36,
    borderWidth: PIXEL_BORDER_WIDTH,
    borderStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  dayText: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
});
