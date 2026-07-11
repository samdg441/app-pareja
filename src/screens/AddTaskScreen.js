import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

// ── 8 color scales (each 5 intensities) ─────────────────────────
const COLOR_SCALES = {
  Red: ['#FEE2E2', '#FCA5A5', '#F87171', '#EF4444', '#B91C1C'],
  Blue: ['#E0F2FE', '#7DD3FC', '#38BDF8', '#0EA5E9', '#0369A1'],
  Green: ['#D1FAE5', '#6EE7B7', '#34D399', '#10B981', '#047857'],
  Purple: ['#F3E8FF', '#D8B4FE', '#A855F7', '#7E22CE', '#581C87'],
  Pink: ['#FCE7F3', '#F9A8D4', '#F472B6', '#EC4899', '#BE185D'],
  Orange: ['#FFF7ED', '#FED7AA', '#FDBA74', '#F97316', '#C2410C'],
  Teal: ['#CCFBF1', '#99F6E4', '#2DD4BF', '#0D9488', '#115E59'],
  Gold: ['#FEF9C3', '#FDE047', '#FACC15', '#EAB308', '#A16207'],
};

const SCALE_NAMES = Object.keys(COLOR_SCALES);

const AddTaskScreen = () => {
  const { theme } = useTheme();

  const [trackerName, setTrackerName] = useState('');
  const [selectedScale, setSelectedScale] = useState('Blue');
  const [levels, setLevels] = useState({
    1: '1-3',
    2: '4-6',
    3: '7-9',
    4: '10+',
  });

  const currentScale = COLOR_SCALES[selectedScale];

  const handleSave = () => {
    if (!trackerName.trim()) {
      Alert.alert('Missing name', 'Please enter a tracker name.');
      return;
    }
    Alert.alert('Tracker Saved!', `"${trackerName}" created with ${selectedScale} scale.`);
    setTrackerName('');
    setSelectedScale('Blue');
    setLevels({ 1: '1-3', 2: '4-6', 3: '7-9', 4: '10+' });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: theme.primary }]}>
        CREATE NEW TRACKER
      </Text>

      {/* Tracker name input */}
      <TextInput
        style={[
          styles.input,
          {
            color: theme.textPrimary,
            borderColor: theme.border,
            backgroundColor: theme.cardBackground,
          },
        ]}
        placeholder="Tracker Name"
        placeholderTextColor={theme.textSecondary}
        value={trackerName}
        onChangeText={setTrackerName}
        fontFamily="PressStart2P-Regular"
      />

      {/* Color scale picker */}
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
        COLOR SCALE
      </Text>
      <View style={styles.scaleGrid}>
        {SCALE_NAMES.map(scaleName => (
          <TouchableOpacity
            key={scaleName}
            style={[
              styles.scaleCard,
              {
                borderColor:
                  selectedScale === scaleName ? theme.primary : theme.border,
                backgroundColor: theme.cardBackground,
              },
            ]}
            onPress={() => setSelectedScale(scaleName)}
          >
            <View style={styles.scalePreview}>
              {COLOR_SCALES[scaleName].map((color, idx) => (
                <View
                  key={idx}
                  style={[styles.scaleDot, { backgroundColor: color }]}
                />
              ))}
            </View>
            <Text style={[styles.scaleName, { color: theme.textPrimary }]}>
              {scaleName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Intensity level definitions */}
      <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 20 }]}>
        INTENSITY LEVELS
      </Text>
      {[1, 2, 3, 4].map(level => (
        <View key={level} style={styles.levelRow}>
          <View
            style={[
              styles.levelColorBox,
              { backgroundColor: currentScale[level] },
            ]}
          />
          <TextInput
            style={[
              styles.levelInput,
              {
                color: theme.textPrimary,
                borderColor: theme.border,
                backgroundColor: theme.cardBackground,
              },
            ]}
            placeholder={`Level ${level} range`}
            placeholderTextColor={theme.textSecondary}
            value={levels[level]}
            onChangeText={text => setLevels(prev => ({ ...prev, [level]: text }))}
            fontFamily="PressStart2P-Regular"
          />
        </View>
      ))}

      {/* Save button */}
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: theme.primary }]}
        onPress={handleSave}
      >
        <Text style={[styles.saveButtonText, { color: theme.headerTint }]}>
          SAVE TRACKER
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddTaskScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 25,
  },
  input: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 11,
    borderWidth: 3,
    padding: 12,
    marginBottom: 20,
    borderRadius: 0,
  },
  sectionTitle: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 13,
    marginBottom: 12,
  },
  scaleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  scaleCard: {
    width: '48%',
    borderWidth: 3,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  scalePreview: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  scaleDot: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#000',
  },
  scaleName: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 11,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelColorBox: {
    width: 30,
    height: 30,
    borderWidth: 2,
    borderColor: '#000',
    marginRight: 12,
    borderRadius: 4,
  },
  levelInput: {
    flex: 1,
    fontFamily: 'PressStart2P-Regular',
    fontSize: 11,
    borderWidth: 2,
    padding: 10,
  },
  saveButton: {
    marginTop: 30,
    paddingVertical: 16,
    borderWidth: 4,
    borderColor: '#000',
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 14,
  },
});