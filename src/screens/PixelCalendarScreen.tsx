import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { PixelCalendar } from '../components/PixelCalendar';
import { PixelButton } from '../components/PixelButton';

// Dummy tasks for demonstration
const DUMMY_TASKS = [
  { id: '1', name: 'Daily Walk', color: '#2ECC71', completedDates: ['2024-01-05', '2024-01-06', '2024-01-07', '2024-01-10', '2024-01-12'] },
  { id: '2', name: 'Read Book', color: '#3498DB', completedDates: ['2024-01-01', '2024-01-03', '2024-01-08', '2024-01-11'] },
  { id: '3', name: 'Meditation', color: '#9B59B6', completedDates: ['2024-01-02', '2024-01-04', '2024-01-09', '2024-01-13', '2024-01-14'] },
];

export const PixelCalendarScreen = () => {
  const { theme } = useTheme();
  const [selectedTaskId, setSelectedTaskId] = useState<string>(DUMMY_TASKS[0].id);

  const selectedTask = DUMMY_TASKS.find((t) => t.id === selectedTaskId) || DUMMY_TASKS[0];

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text
        style={[
          styles.title,
          { color: theme.text },
        ]}
      >
        Habit Tracker
      </Text>

      <View style={styles.taskSelector}>
        <Text
          style={[
            styles.selectorLabel,
            { color: theme.text },
          ]}
        >
          Select Task:
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {DUMMY_TASKS.map((task) => (
            <PixelButton
              key={task.id}
              onPress={() => setSelectedTaskId(task.id)}
              variant={selectedTaskId === task.id ? 'primary' : 'secondary'}
              style={styles.taskButton}
            >
              <Text
                style={[
                  styles.taskButtonText,
                  { 
                    color: selectedTaskId === task.id 
                      ? theme.background 
                      : theme.text 
                  },
                ]}
              >
                {task.name}
              </Text>
            </PixelButton>
          ))}
        </ScrollView>
      </View>

      <View
        style={[
          styles.calendarContainer,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <PixelCalendar
          completedDates={selectedTask.completedDates}
          selectedTaskColor={selectedTask.color}
        />
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendBox,
              { backgroundColor: selectedTask.color, borderColor: theme.border },
            ]}
          />
          <Text
            style={[
              styles.legendText,
              { color: theme.textMuted },
            ]}
          >
            Completed
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendBox,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          />
          <Text
            style={[
              styles.legendText,
              { color: theme.textMuted },
            ]}
          >
            Not Completed
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  taskSelector: {
    marginBottom: 24,
  },
  selectorLabel: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  taskButton: {
    marginHorizontal: 4,
  },
  taskButtonText: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  calendarContainer: {
    borderWidth: 4,
    borderStyle: 'solid',
    borderRadius: 0,
    marginBottom: 24,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendBox: {
    width: 24,
    height: 24,
    borderWidth: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
});
