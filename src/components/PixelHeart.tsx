import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { PIXEL_BORDER_WIDTH } from '../theme/colors';

type HeartState = 'empty' | 'loading' | 'full';

interface PixelHeartProps {
  state: HeartState;
  onPress?: () => void;
  size?: number;
}

export const PixelHeart: React.FC<PixelHeartProps> = ({
  state,
  onPress,
  size = 150,
}) => {
  const { theme } = useTheme();

  const getHeartColor = () => {
    switch (state) {
      case 'full':
        return theme.primaryDark;
      case 'loading':
        return theme.primaryLight;
      case 'empty':
      default:
        return theme.surface;
    }
  };

  const getBorderColor = () => {
    return theme.primaryDark;
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          width: size,
          height: size,
          backgroundColor: getHeartColor(),
          borderColor: getBorderColor(),
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.heartContent}>
        {state === 'loading' ? (
          <Ionicons
            name="hourglass"
            size={size * 0.5}
            color={theme.primaryDark}
          />
        ) : (
          <Ionicons
            name={state === 'full' ? 'heart' : 'heart-outline'}
            size={size * 0.6}
            color={state === 'empty' ? theme.primaryMedium : theme.background}
          />
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: PIXEL_BORDER_WIDTH,
    borderStyle: 'solid',
    borderRadius: 0, // Keep it pixelated, no rounding
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 5,
  },
  heartContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
