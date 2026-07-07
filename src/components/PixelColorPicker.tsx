import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { PIXEL_BORDER_WIDTH } from '../theme/colors';

interface PixelColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

// Predefined pixel art style colors
const PIXEL_COLORS = [
  '#E74C3C', // Red
  '#E67E22', // Orange
  '#F1C40F', // Yellow
  '#2ECC71', // Green
  '#1ABC9C', // Teal
  '#3498DB', // Blue
  '#9B59B6', // Purple
  '#E91E63', // Pink
];

export const PixelColorPicker: React.FC<PixelColorPickerProps> = ({
  selectedColor,
  onColorSelect,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {PIXEL_COLORS.map((color) => (
        <Pressable
          key={color}
          onPress={() => onColorSelect(color)}
          style={[
            styles.colorSwatch,
            {
              backgroundColor: color,
              borderColor: theme.primaryDark,
              borderWidth: selectedColor === color ? PIXEL_BORDER_WIDTH : 2,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    margin: 4,
  },
});
