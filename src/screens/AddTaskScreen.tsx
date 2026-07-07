import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { PixelButton } from '../components/PixelButton';
import { PixelInput } from '../components/PixelInput';
import { PixelColorPicker } from '../components/PixelColorPicker';
import { supabase } from '../utils/supabase';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const AddTaskScreen = () => {
  const { theme } = useTheme();
  const [taskName, setTaskName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3498DB');
  const [restDays, setRestDays] = useState<number[]>([]);

  const toggleRestDay = (dayIndex: number) => {
    if (restDays.includes(dayIndex)) {
      setRestDays(restDays.filter((d) => d !== dayIndex));
    } else {
      setRestDays([...restDays, dayIndex]);
    }
  };

  const handleSaveTask = async () => {
    if (!taskName.trim()) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Please log in first');
        return;
      }

      const { error } = await supabase.from('tasks').insert({
        user_id: user.id,
        name: taskName.trim(),
        color: selectedColor,
        rest_days: restDays,
      });

      if (error) throw error;

      Alert.alert('Success', 'Task created!');
      setTaskName('');
      setSelectedColor('#3498DB');
      setRestDays([]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

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
        Add New Habit
      </Text>

      <View style={styles.section}>
        <Text
          style={[
            styles.label,
            { color: theme.text },
          ]}
        >
          Task Name
        </Text>
        <PixelInput
          value={taskName}
          onChangeText={setTaskName}
          placeholder="e.g., Daily Walk"
          style={styles.input}
        />
      </View>

      <View style={styles.section}>
        <Text
          style={[
            styles.label,
            { color: theme.text },
          ]}
        >
          Task Color
        </Text>
        <PixelColorPicker
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
        />
        <View
          style={[
            styles.colorPreview,
            { backgroundColor: selectedColor, borderColor: theme.primaryDark },
          ]}
        />
      </View>

      <View style={styles.section}>
        <Text
          style={[
            styles.label,
            { color: theme.text },
          ]}
        >
          Rest Days
        </Text>
        <Text
          style={[
            styles.hint,
            { color: theme.textMuted },
          ]}
        >
          Select days when you don't need to complete this habit
        </Text>
        <View style={styles.restDaysContainer}>
          {DAYS_OF_WEEK.map((day, index) => {
            const isSelected = restDays.includes(index);
            return (
              <PixelButton
                key={day}
                onPress={() => toggleRestDay(index)}
                variant={isSelected ? 'primary' : 'secondary'}
                style={styles.dayButton}
              >
                <Text
                  style={[
                    styles.dayButtonText,
                    { color: isSelected ? theme.background : theme.text },
                  ]}
                >
                  {day}
                </Text>
              </PixelButton>
            );
          })}
        </View>
      </View>

      <PixelButton
        onPress={handleSaveTask}
        style={styles.saveButton}
      >
        <Text
          style={[
            styles.saveButtonText,
            { color: theme.background },
          ]}
        >
          Save Task
        </Text>
      </PixelButton>
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
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  input: {
    marginBottom: 8,
  },
  colorPreview: {
    width: 60,
    height: 60,
    borderWidth: 4,
    marginTop: 8,
    alignSelf: 'center',
  },
  restDaysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  dayButton: {
    margin: 4,
  },
  dayButtonText: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  saveButton: {
    marginTop: 16,
  },
  saveButtonText: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
});
