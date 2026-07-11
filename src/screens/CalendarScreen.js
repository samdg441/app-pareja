import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

// ── Habit definitions (name + 5‑color scale) ──────────────────────
const HABITS = [
  {
    name: 'Water',
    scale: ['#E0F2FE', '#7DD3FC', '#38BDF8', '#0EA5E9', '#0369A1'],
  },
  {
    name: 'Reading',
    scale: ['#FCE7F3', '#F9A8D4', '#F472B6', '#EC4899', '#BE185D'],
  },
  {
    name: 'Exercise',
    scale: ['#D1FAE5', '#6EE7B7', '#34D399', '#10B981', '#047857'],
  },
];

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const INTENSITY_LABELS = ['0', '1-3', '4-6', '7-9', '10+'];

// ── Helper: get days in month ─────────────────────────────────────
const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

// ── Helper: get weekday index for 1st of month (0 = Sunday) ─────
const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

// ── Dummy log generator ───────────────────────────────────────────
const generateDummyLog = (month, year) => {
  const now = new Date();
  const days = getDaysInMonth(month, year);
  const log = {};
  for (let d = 1; d <= days; d++) {
    const date = new Date(year, month, d);
    if (date > now) {
      log[d] = null;   // future days are unlogged
    } else {
      log[d] = Math.floor(Math.random() * 5);
    }
  }
  return log;
};

const CalendarScreen = () => {
  const { theme } = useTheme();

  // ── State ────────────────────────────────────────────────────────
  const now = new Date();
  const [currentHabitIndex, setCurrentHabitIndex] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [logData, setLogData] = useState({});

  // ── Modal state ──────────────────────────────────────────────────
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(1);
  const [selectedIntensity, setSelectedIntensity] = useState(0);

  const currentHabit = HABITS[currentHabitIndex];
  const habitColors = currentHabit.scale;
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const firstDayIndex = getFirstDayOfMonth(selectedMonth, selectedYear);

  const monthNames = [
    'JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE',
    'JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'
  ];

  // ── Regenerate dummy logs when month/year/habit changes ────────
  useEffect(() => {
    setLogData(generateDummyLog(selectedMonth, selectedYear));
  }, [selectedMonth, selectedYear]);

  // ── Habit navigation ────────────────────────────────────────────
  const goToPrevHabit = () => {
    if (currentHabitIndex > 0) setCurrentHabitIndex(prev => prev - 1);
  };
  const goToNextHabit = () => {
    if (currentHabitIndex < HABITS.length - 1) setCurrentHabitIndex(prev => prev + 1);
  };

  // ── Month navigation (only past months allowed) ─────────────────
  const goToPrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };
  const goToNextMonth = () => {
    // Prevent going into future
    if (selectedYear > now.getFullYear()) return;
    if (selectedYear === now.getFullYear() && selectedMonth >= now.getMonth()) return;

    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  // ── Modal handlers ──────────────────────────────────────────────
  const openModal = () => {
    setSelectedDate(1);
    setSelectedIntensity(0);
    setModalVisible(true);
  };
  const saveLog = () => {
    setLogData(prev => ({ ...prev, [selectedDate]: selectedIntensity }));
    setModalVisible(false);
  };

  // ── Cell color ──────────────────────────────────────────────────
  const getCellColor = (day) => {
    if (logData[day] === null || logData[day] === undefined) return theme.cardBackground;
    return habitColors[logData[day]];
  };

  // ── Build grid array with leading blanks ────────────────────────
  const gridCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    gridCells.push({ type: 'blank', key: `blank-${i}` });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    gridCells.push({ type: 'day', day: d, key: `day-${d}` });
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* ── Navigation rows ────────────────────────────────────── */}
      <View style={[styles.navContainer, { borderColor: theme.border }]}>
        {/* Habit switcher */}
        <View style={styles.navRow}>
          <TouchableOpacity onPress={goToPrevHabit} style={styles.arrowBtn}>
            <Text style={[styles.arrowText, { color: theme.primary }]}>◀</Text>
          </TouchableOpacity>
          <Text style={[styles.habitTitle, { color: theme.textPrimary }]}>
            {currentHabit.name}
          </Text>
          <TouchableOpacity onPress={goToNextHabit} style={styles.arrowBtn}>
            <Text style={[styles.arrowText, { color: theme.primary }]}>▶</Text>
          </TouchableOpacity>
        </View>

        {/* Month / Year switcher */}
        <View style={styles.navRow}>
          <TouchableOpacity onPress={goToPrevMonth} style={styles.arrowBtn}>
            <Text style={[styles.arrowText, { color: theme.primary }]}>◀</Text>
          </TouchableOpacity>
          <Text style={[styles.monthTitle, { color: theme.textPrimary }]}>
            {monthNames[selectedMonth]} {selectedYear}
          </Text>
          <TouchableOpacity
            onPress={goToNextMonth}
            style={styles.arrowBtn}
            disabled={
              selectedYear === now.getFullYear() &&
              selectedMonth >= now.getMonth()
            }
          >
            <Text
              style={[
                styles.arrowText,
                {
                  color:
                    selectedYear === now.getFullYear() &&
                    selectedMonth >= now.getMonth()
                      ? theme.textSecondary
                      : theme.primary,
                },
              ]}
            >
              ▶
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Weekday headers ─────────────────────────────────────── */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day, idx) => (
          <View key={idx} style={styles.weekdayCell}>
            <Text style={[styles.weekdayText, { color: theme.textSecondary }]}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* ── Heatmap grid ────────────────────────────────────────── */}
      <ScrollView contentContainerStyle={styles.gridScroll}>
        <View style={styles.heatmapGrid}>
          {gridCells.map(cell => {
            if (cell.type === 'blank') {
              return <View key={cell.key} style={styles.blankCell} />;
            }
            const day = cell.day;
            return (
              <View
                key={cell.key}
                style={[
                  styles.dayCell,
                  { backgroundColor: getCellColor(day), borderColor: theme.border },
                ]}
              />
            );
          })}
        </View>
      </ScrollView>

      {/* ── Register button ─────────────────────────────────────── */}
      <TouchableOpacity
        style={[styles.registerButton, { backgroundColor: theme.primary }]}
        onPress={openModal}
      >
        <Text style={[styles.registerText, { color: theme.headerTint }]}>
          REGISTER ACTIVITY
        </Text>
      </TouchableOpacity>

      {/* ── Log entry modal (unchanged structure, only colors adapt) */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalBox,
              { backgroundColor: theme.cardBackground, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.primary }]}>
              LOG ENTRY
            </Text>

            {/* Date selection */}
            <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>
              SELECT DATE
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.dateRow}>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const isFuture =
                    selectedYear > now.getFullYear() ||
                    (selectedYear === now.getFullYear() && selectedMonth > now.getMonth()) ||
                    (selectedYear === now.getFullYear() && selectedMonth === now.getMonth() && day > now.getDate());
                  const isSelected = day === selectedDate;
                  return (
                    <TouchableOpacity
                      key={day}
                      disabled={isFuture}
                      style={[
                        styles.dateItem,
                        {
                          borderColor: theme.border,
                          backgroundColor: isSelected
                            ? theme.primary
                            : isFuture
                            ? theme.background
                            : theme.cardBackground,
                        },
                      ]}
                      onPress={() => setSelectedDate(day)}
                    >
                      <Text
                        style={{
                          fontFamily: 'PressStart2P-Regular',
                          fontSize: 10,
                          color: isSelected
                            ? theme.headerTint
                            : isFuture
                            ? theme.textSecondary
                            : theme.textPrimary,
                        }}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Intensity selection */}
            <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>
              INTENSITY
            </Text>
            <View style={styles.intensityRow}>
              {habitColors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.intensityBlock,
                    {
                      backgroundColor: color,
                      borderColor: selectedIntensity === index ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setSelectedIntensity(index)}
                >
                  <Text style={styles.intensityLabel}>
                    {INTENSITY_LABELS[index]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.primary }]}
              onPress={saveLog}
            >
              <Text style={[styles.saveButtonText, { color: theme.headerTint }]}>
                SAVE LOG
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: theme.textSecondary, fontFamily: 'PressStart2P-Regular' }}>
                CANCEL
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CalendarScreen;

// ─── Styles ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navContainer: {
    borderBottomWidth: 3,
    paddingBottom: 8,
    marginBottom: 6,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 6,
  },
  arrowBtn: {
    padding: 6,
  },
  arrowText: {
    fontSize: 22,
    fontFamily: 'PressStart2P-Regular',
  },
  habitTitle: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 15,
  },
  monthTitle: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 13,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekdayText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 10,
  },
  gridScroll: {
    paddingHorizontal: 4,
    paddingBottom: 10,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 2,
  },
  blankCell: {
    width: '13.2%',      // approx 1/7 minus gap
    aspectRatio: 1,
    marginBottom: 2,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  dayCell: {
    width: '13.2%',
    aspectRatio: 1,
    borderWidth: 2,
    marginBottom: 2,
  },
  registerButton: {
    marginHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 16,
    borderWidth: 4,
    borderColor: '#000',
    alignItems: 'center',
  },
  registerText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 14,
  },
  // Modal styles (same as before)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '90%',
    borderWidth: 4,
    borderRadius: 8,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 11,
    marginBottom: 8,
    marginTop: 12,
  },
  dateRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dateItem: {
    width: 30,
    height: 30,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    borderRadius: 2,
  },
  intensityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  intensityBlock: {
    flex: 1,
    paddingVertical: 14,
    marginHorizontal: 3,
    borderWidth: 2,
    alignItems: 'center',
    borderRadius: 4,
  },
  intensityLabel: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 10,
    color: '#000',
  },
  saveButton: {
    paddingVertical: 12,
    borderWidth: 3,
    borderColor: '#000',
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 13,
  },
  closeButton: {
    alignItems: 'center',
    padding: 8,
  },
});