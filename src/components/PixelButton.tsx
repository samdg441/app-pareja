import React from 'react';
import { StyleSheet, Pressable, Text, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { PIXEL_BORDER_WIDTH, PIXEL_SHADOW_OFFSET } from '../theme/colors';

interface PixelButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PixelButton: React.FC<PixelButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return theme.surface;
    switch (variant) {
      case 'primary':
        return theme.primaryMedium;
      case 'secondary':
        return theme.primaryLight;
      case 'danger':
        return theme.error;
      default:
        return theme.primaryMedium;
    }
  };

  const getBorderColor = () => {
    if (disabled) return theme.border;
    return theme.primaryDark;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: PIXEL_BORDER_WIDTH,
    borderStyle: 'solid',
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: PIXEL_SHADOW_OFFSET,
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
