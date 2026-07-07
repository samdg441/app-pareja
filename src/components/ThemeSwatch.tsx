import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { ColorPalette, ThemeName, themes } from '../theme/colors';
import { PIXEL_BORDER_WIDTH } from '../theme/colors';

interface ThemeSwatchProps {
  themeName: ThemeName;
  isSelected: boolean;
  onSelect: (themeName: ThemeName) => void;
}

export const ThemeSwatch: React.FC<ThemeSwatchProps> = ({
  themeName,
  isSelected,
  onSelect,
}) => {
  const palette = themes[themeName];

  return (
    <Pressable
      onPress={() => onSelect(themeName)}
      style={[
        styles.container,
        {
          borderColor: isSelected ? palette.primaryDark : palette.border,
          borderWidth: isSelected ? PIXEL_BORDER_WIDTH : 2,
        },
      ]}
    >
      <View
        style={[
          styles.colorRow,
        ]}
      >
        <View style={[styles.colorSegment, { backgroundColor: palette.background }]} />
        <View style={[styles.colorSegment, { backgroundColor: palette.surface }]} />
        <View style={[styles.colorSegment, { backgroundColor: palette.primaryLight }]} />
        <View style={[styles.colorSegment, { backgroundColor: palette.primaryMedium }]} />
      </View>
      <View
        style={[
          styles.colorRow,
        ]}
      >
        <View style={[styles.colorSegment, { backgroundColor: palette.primaryDark }]} />
        <View style={[styles.colorSegment, { backgroundColor: palette.text }]} />
        <View style={[styles.colorSegment, { backgroundColor: palette.textMuted }]} />
        <View style={[styles.colorSegment, { backgroundColor: palette.error }]} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 60,
    margin: 8,
    padding: 0,
  },
  colorRow: {
    flexDirection: 'row',
    flex: 1,
  },
  colorSegment: {
    flex: 1,
    height: '100%',
  },
});
