import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

// Assets
const bgImage = require('../../assets/garden.png');
const bowlImg = require('../../assets/bowl.png');
const bedImg = require('../../assets/bed.png');
const heartImg = require('../../assets/heart_4.png');

// Sprites
const idleSprites = [
  require('../../assets/idle_1.png'),
  require('../../assets/idle_2.png'),
];
const eatSprites = [
  require('../../assets/eat_1.png'),
  require('../../assets/eat_2.png'),
];
const sleepSprites = [
  require('../../assets/sleep_1.png'),
  require('../../assets/sleep_2.png'),
];

const PetScreen = () => {
  const { theme } = useTheme();

  // ── Pet states ──────────────────────────────────────────────────
  const [hunger, setHunger] = useState(50);
  const [happiness, setHappiness] = useState(50);
  const [petAction, setPetAction] = useState('idle'); // 'idle' | 'eating' | 'sleeping'
  const [frame, setFrame] = useState(1);

  // Floating hearts
  const [hearts, setHearts] = useState([]);
  const heartsAnim = useRef([]);

  // ── Sprite animation loop (500ms) ──────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prev => (prev === 1 ? 2 : 1));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // ── Select current sprite based on action ──────────────────────
  const currentDogFrame = (() => {
    switch (petAction) {
      case 'eating':  return eatSprites[frame - 1];
      case 'sleeping':return sleepSprites[frame - 1];
      default:        return idleSprites[frame - 1];
    }
  })();

  // ── Tap the dog → floating hearts + happiness boost ────────────
  const handlePetTap = () => {
    if (petAction === 'sleeping') return;

    setHappiness(prev => Math.min(prev + 10, 100));

    const newHearts = [
      { id: Date.now(),     offsetX: 25 },
      { id: Date.now() + 1, offsetX: 0 },
      { id: Date.now() + 2, offsetX: -25 },
    ];
    setHearts(prev => [...prev, ...newHearts]);

    newHearts.forEach(h => {
      const anim = new Animated.Value(0);
      heartsAnim.current.push({ id: h.id, anim });

      Animated.timing(anim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }).start(() => {
        setHearts(prev => prev.filter(heart => heart.id !== h.id));
      });
    });
  };

  // ── Tap the food bowl → start eating ──────────────────────────
  const handleFeed = () => {
    if (petAction === 'sleeping') return;

    setPetAction('eating');
    setHunger(prev => Math.min(prev + 15, 100));

    // Automatically go back to idle after 3 seconds
    setTimeout(() => {
      setPetAction(prev => (prev === 'eating' ? 'idle' : prev));
    }, 3000);
  };

  // ── Tap the bed → toggle sleeping ─────────────────────────────
  const handleBedToggle = () => {
    if (petAction === 'sleeping') {
      setPetAction('idle');
    } else {
      setPetAction('sleeping');
    }
  };

  // ── Progress bar component (retro 8‑bit) ──────────────────────
  const ProgressBar = ({ label, value, color }) => (
    <View style={styles.progressContainer}>
      <Text style={[styles.progressLabel, { color: theme.textPrimary }]}>
        {label}
      </Text>
      <View style={[styles.barBg, { borderColor: theme.border }]}>
        <View
          style={[
            styles.barFill,
            { width: `${value}%`, backgroundColor: color || theme.primary },
          ]}
        />
      </View>
      <Text style={[styles.progressValue, { color: theme.textSecondary }]}>
        {value}/100
      </Text>
    </View>
  );

  return (
    <ImageBackground
      source={bgImage}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* HUD – fully opaque, no semi‑transparent overlay */}
      <View style={[styles.hud, { backgroundColor: theme.cardBackground }]}>
        <ProgressBar label="HUNGER" value={hunger} color="#FF8C00" />
        <ProgressBar label="HAPPINESS" value={happiness} color="#FF69B4" />
      </View>

      {/* Central pet area */}
      <View style={styles.petArea}>
        {/* Floating hearts */}
        {hearts.map(heart => {
          const animObj = heartsAnim.current.find(a => a.id === heart.id);
          const translateY = animObj
            ? animObj.anim.interpolate({ inputRange: [0, 1], outputRange: [0, -130] })
            : 0;
          const opacity = animObj
            ? animObj.anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] })
            : 1;

          return (
            <Animated.Image
              key={heart.id}
              source={heartImg}
              style={[
                styles.floatingHeart,
                {
                  left: '50%',
                  marginLeft: -12 + heart.offsetX,
                  transform: [{ translateY }],
                  opacity,
                },
              ]}
            />
          );
        })}

        {/* Character container with bed + dog */}
        <View style={styles.characterContainer}>
          {/* Bed – shown only when sleeping, behind the dog */}
          {petAction === 'sleeping' && (
            <Image source={bedImg} style={styles.bedImage} resizeMode="contain" />
          )}

          {/* Dog – always on top */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePetTap}
            disabled={petAction === 'sleeping'}
          >
            <Image
              source={currentDogFrame}
              style={styles.dogImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Items row – solid background, no transparency */}
      <View style={[styles.itemsRow, { backgroundColor: theme.cardBackground }]}>
        {/* Food bowl (tap to feed) */}
        <TouchableOpacity
          style={[styles.itemButton, { borderColor: theme.border }]}
          onPress={handleFeed}
        >
          <Image source={bowlImg} style={styles.itemIcon} resizeMode="contain" />
          <Text style={[styles.itemLabel, { color: theme.textSecondary }]}>FOOD</Text>
        </TouchableOpacity>

        {/* Bed (tap to toggle sleeping) */}
        <TouchableOpacity
          style={[styles.itemButton, { borderColor: theme.border }]}
          onPress={handleBedToggle}
        >
          <Image source={bedImg} style={styles.itemIcon} resizeMode="contain" />
          <Text style={[styles.itemLabel, { color: theme.textSecondary }]}>
            {petAction === 'sleeping' ? 'WAKE UP' : 'SLEEP'}
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default PetScreen;

// ─── Styles ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  hud: {
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 6,
    borderBottomWidth: 3,
    borderBottomColor: '#000',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 10,
    width: 85,
  },
  barBg: {
    flex: 1,
    height: 14,
    borderWidth: 2,
    backgroundColor: '#111',
    marginHorizontal: 8,
  },
  barFill: {
    height: '100%',
  },
  progressValue: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 10,
    width: 40,
    textAlign: 'right',
  },
  petArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  characterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 250,
    height: 250,   // Contenedor más ajustado al tamaño del perro
    position: 'relative',
  },
  bedImage: {
    position: 'absolute',
    top: 70,       // Empuja la cama hacia abajo justo debajo del cuerpo del perro
    width: 250,    // Cama mucho más grande y ancha
    height: 160,
    alignSelf: 'center',
    zIndex: 0,     // Asegura que quede atrás
  },
  dogImage: {
    width: 200,
    height: 200,
    zIndex: 1,     // Asegura que quede adelante
  },
  floatingHeart: {
    position: 'absolute',
    top: -20,
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  itemsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12, // Reducido el espacio vertical
    borderTopWidth: 3,
    borderTopColor: '#000',
  },
  itemButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 85,       // Reducido de 100 a 85
    height: 75,      // Reducido de 90 a 75
    borderWidth: 3,
    borderColor: '#000',
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
  itemIcon: {
    width: 36,       // Reducido de 48 a 36
    height: 36,
  },
  itemLabel: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 8,     // Letra un puntito más pequeña
    marginTop: 4,
  },
});