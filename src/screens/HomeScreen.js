import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

// Import heart images (0 to 4)
// Import heart images (0 to 4)
const heartImages = [
  require('../../assets/heart_0.png'),
  require('../../assets/heart_1.png'),
  require('../../assets/heart_2.png'),
  require('../../assets/heart_3.png'),
  require('../../assets/heart_4.png'),
];

const HomeScreen = () => {
  const { theme } = useTheme();
  const [touchesToday, setTouchesToday] = useState(0);

  const handleSendLove = () => {
    setTouchesToday(prev => prev + 1);
  };

  // Prevent array index out of bounds: cap at 4
  const heartIndex = Math.min(touchesToday, 4);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top text section */}
      <Text style={[styles.title, { color: theme.primary }]}>TOUCH</Text>
      <Text style={[styles.subtitle, { color: theme.primary }]}>
        SI EXTRAÑAS A TU PAREJA
      </Text>

      {/* Heart display box */}
      <View style={[styles.heartBox, { borderColor: theme.primary }]}>
        <Image
          source={heartImages[heartIndex]}
          style={styles.heartImage}
          resizeMode="contain"
        />
      </View>

      {/* Send button */}
      <TouchableOpacity
        style={[styles.sendButton, { backgroundColor: theme.primary }]}
        onPress={handleSendLove}
        activeOpacity={0.8}
      >
        <Text style={[styles.sendButtonText, { color: theme.background }]}>
          TOCA PARA ENVIAR AMOR!
        </Text>
      </TouchableOpacity>

      {/* Touches counter */}
      <View style={[styles.statusContainer, { borderColor: theme.primary }]}>
        <Text style={[styles.statusText, { color: theme.primary }]}>
          TOQUES DE AMOR: {touchesToday}
        </Text>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 16,
  },
  heartBox: {
    width: 200,
    aspectRatio: 1,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  heartImage: {
    width: '80%',
    height: '80%',
  },
  sendButton: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderWidth: 3,
    borderColor: '#000', // gives a chunky pixel border
    marginBottom: 20,
  },
  sendButtonText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 10,
  },
  statusContainer: {
    borderWidth: 2,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  statusText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 11,
  },
});