import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

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

  // ── Continuous animations ────────────────────────────────────────
  const heartBreath = useRef(new Animated.Value(1)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;

  // ── One‑shot bounce values (start at 1, no effect) ──────────────
  const heartBounce = useRef(new Animated.Value(1)).current;
  const buttonBounce = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Heart: gentle breath 0.97 ↔ 1.03
    const heartLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(heartBreath, {
          toValue: 1.03,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(heartBreath, {
          toValue: 0.97,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    heartLoop.start();

    // Button: continuous pulse 1 ↔ 1.08
    const buttonLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulse, {
          toValue: 1.08,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(buttonPulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    buttonLoop.start();

    return () => {
      heartLoop.stop();
      buttonLoop.stop();
    };
  }, []);

  // ── Heart pop when touches increase ─────────────────────────────
  useEffect(() => {
    if (touchesToday === 0) return;
    Animated.sequence([
      Animated.timing(heartBounce, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(heartBounce, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [touchesToday]);

  // ── Button bounce on press ──────────────────────────────────────
  const handleSendLove = () => {
    setTouchesToday(prev => prev + 1);

    Animated.sequence([
      Animated.timing(buttonBounce, {
        toValue: 0.9,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(buttonBounce, {
        toValue: 1.15,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonBounce, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const heartIndex = Math.min(touchesToday, 4);

  // Combine continuous + bounce scales
  const heartScale = Animated.multiply(heartBreath, heartBounce);
  const buttonScale = Animated.multiply(buttonPulse, buttonBounce);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top HUD */}
      <Text style={[styles.title, { color: theme.textPrimary }]}>TOUCH</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        SI EXTRAÑAS A TU PAREJA
      </Text>

      {/* Heart box */}
      <Animated.View
        style={[
          styles.heartBox,
          { borderColor: theme.border, transform: [{ scale: heartScale }] },
        ]}
      >
        <Image
          source={heartImages[heartIndex]}
          style={styles.heartImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Send button */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleSendLove}
        style={styles.buttonTouchArea}
      >
        <Animated.View
          style={[
            styles.sendButton,
            {
              backgroundColor: theme.primary,
              borderColor: theme.border,
              transform: [{ scale: buttonScale }],
            },
          ]}
        >
          <Text style={[styles.sendButtonText, { color: theme.headerTint }]}>
            TOCA PARA ENVIAR AMOR!
          </Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Status */}
      <View style={[styles.statusContainer, { borderColor: theme.border }]}>
        <Text style={[styles.statusText, { color: theme.textPrimary }]}>
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
  buttonTouchArea: {
    marginBottom: 20,
  },
  sendButton: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderWidth: 3,
    borderColor: '#000',
  },
  sendButtonText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 10,
    textAlign: 'center',
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