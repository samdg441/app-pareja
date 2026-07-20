import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { supabase } from '../lib/supabase';

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
  const [sleep, setSleep] = useState(50);
  const [petAction, setPetAction] = useState('idle');
  const [frame, setFrame] = useState(1);
  const [coupleId, setCoupleId] = useState(null);
  const [loaded, setLoaded] = useState(false);

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

  // ── Cargar couple_id y estado inicial de la mascota ─────────────
  useEffect(() => {
    const fetchPetState = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          Alert.alert('Error', 'Debes iniciar sesión.');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('couple_id')
          .eq('id', user.id)
          .single();

        if (!profile?.couple_id) {
          Alert.alert('Error', 'No tienes una pareja vinculada.');
          return;
        }

        setCoupleId(profile.couple_id);

        const { data: petState, error: petError } = await supabase
          .from('pet_state')
          .select('*')
          .eq('couple_id', profile.couple_id)
          .maybeSingle();

        if (petError) {
          Alert.alert('Error', 'No se pudo cargar la mascota.');
          return;
        }

        if (petState) {
          const now = new Date();
          const lastUpdated = new Date(petState.last_updated_at);
          const hoursPassed = (now - lastUpdated) / (1000 * 60 * 60);

          let newHunger = petState.hunger;
          let newHappiness = petState.happiness;
          let newSleep = petState.sleep;
          const isSleeping = petState.pet_action === 'sleeping';

          if (hoursPassed > 0) {
            newHunger = Math.max(0, petState.hunger - Math.floor(hoursPassed) * 5);
            newHappiness = Math.max(0, petState.happiness - Math.floor(hoursPassed) * 5);
          }

          if (hoursPassed > 0) {
            const decayUnits = Math.floor(hoursPassed / 2);
            if (isSleeping) {
              newSleep = Math.min(100, petState.sleep + decayUnits * 5);
            } else {
              newSleep = Math.max(0, petState.sleep - decayUnits * 5);
            }
          }

          setHunger(newHunger);
          setHappiness(newHappiness);
          setSleep(newSleep);
          setPetAction(petState.pet_action);

          // Actualizar la base de datos con los valores calculados
          if (hoursPassed > 0) {
            await supabase
              .from('pet_state')
              .update({
                hunger: newHunger,
                happiness: newHappiness,
                sleep: newSleep,
                last_updated_at: now.toISOString(),
              })
              .eq('couple_id', profile.couple_id);
          }
        } else {
          const defaultState = {
            couple_id: profile.couple_id,
            hunger: 50,
            happiness: 50,
            sleep: 50,
            pet_action: 'idle',
            last_updated_at: new Date().toISOString(),
          };
          const { error: insertError } = await supabase
            .from('pet_state')
            .insert(defaultState);
          if (insertError) {
            Alert.alert('Error', 'No se pudo crear el estado de la mascota.');
            return;
          }
          setHunger(50);
          setHappiness(50);
          setSleep(50);
          setPetAction('idle');
        }
      } catch (err) {
        console.error('Error al cargar la mascota:', err);
        Alert.alert('Error', 'Ocurrió un error inesperado.');
      } finally {
        setLoaded(true);
      }
    };

    fetchPetState();
  }, []);

  // ── Persistir estado en Supabase (con verificación de error) ─────
  const persistPetState = async (newHunger, newHappiness, newSleep, newAction) => {
    if (!coupleId) {
      Alert.alert('Error', 'No se ha encontrado el ID de la pareja. Recarga la pantalla.');
      return false;
    }
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('pet_state')
      .update({
        hunger: newHunger,
        happiness: newHappiness,
        sleep: newSleep,
        pet_action: newAction,
        last_updated_at: now,
      })
      .eq('couple_id', coupleId);

    if (error) {
      console.error('Error al guardar estado de mascota:', error);
      Alert.alert('Error', `No se pudo guardar: ${error.message}`);
      return false;
    }
    return true;
  };

  // ── Select current sprite based on action ──────────────────────
  const currentDogFrame = (() => {
    switch (petAction) {
      case 'eating':  return eatSprites[frame - 1];
      case 'sleeping':return sleepSprites[frame - 1];
      default:        return idleSprites[frame - 1];
    }
  })();

  // ── Tap the dog → floating hearts + happiness boost ────────────
  const handlePetTap = async () => {
    if (petAction === 'sleeping') return;

    const newHappiness = Math.min(happiness + 10, 100);
    setHappiness(newHappiness);
    const success = await persistPetState(hunger, newHappiness, sleep, petAction);
    if (!success) {
      setHappiness(happiness); // revertir
      return;
    }

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
  const handleFeed = async () => {
    if (petAction === 'sleeping') return;

    const newHunger = Math.min(hunger + 15, 100);
    setHunger(newHunger);
    setPetAction('eating');
    const success = await persistPetState(newHunger, happiness, sleep, 'eating');
    if (!success) {
      setHunger(hunger);
      setPetAction('idle');
      return;
    }

    setTimeout(async () => {
      setPetAction(prev => {
        if (prev === 'eating') {
          persistPetState(newHunger, happiness, sleep, 'idle');
          return 'idle';
        }
        return prev;
      });
    }, 3000);
  };

  // ── Tap the bed → toggle sleeping ─────────────────────────────
  const handleBedToggle = async () => {
    const newAction = petAction === 'sleeping' ? 'idle' : 'sleeping';
    setPetAction(newAction);
    await persistPetState(hunger, happiness, sleep, newAction);
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

  if (!loaded) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.primary }]}>
          CARGANDO MASCOTA...
        </Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={bgImage}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={[styles.hud, { backgroundColor: theme.cardBackground }]}>
        <ProgressBar label="HUNGER" value={hunger} color="#FF8C00" />
        <ProgressBar label="HAPPINESS" value={happiness} color="#FF69B4" />
        <ProgressBar label="SLEEP" value={sleep} color="#4169E1" />
      </View>

      <View style={styles.petArea}>
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

        <View style={styles.characterContainer}>
          {petAction === 'sleeping' && (
            <Image source={bedImg} style={styles.bedImage} resizeMode="contain" />
          )}

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

      <View style={[styles.itemsRow, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity
          style={[styles.itemButton, { borderColor: theme.border }]}
          onPress={handleFeed}
        >
          <Image source={bowlImg} style={styles.itemIcon} resizeMode="contain" />
          <Text style={[styles.itemLabel, { color: theme.textSecondary }]}>FOOD</Text>
        </TouchableOpacity>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 16,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  hud: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 4,
    borderBottomWidth: 3,
    borderBottomColor: '#000',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressLabel: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 8,
    width: 65,
  },
  barBg: {
    flex: 1,
    height: 12,
    borderWidth: 2,
    backgroundColor: '#111',
    marginHorizontal: 6,
  },
  barFill: {
    height: '100%',
  },
  progressValue: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 8,
    width: 35,
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
    height: 250,
    position: 'relative',
  },
  bedImage: {
    position: 'absolute',
    top: 70,
    width: 250,
    height: 160,
    alignSelf: 'center',
    zIndex: 0,
  },
  dogImage: {
    width: 200,
    height: 200,
    zIndex: 1,
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
    paddingVertical: 12,
    borderTopWidth: 3,
    borderTopColor: '#000',
  },
  itemButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 85,
    height: 75,
    borderWidth: 3,
    borderColor: '#000',
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
  itemIcon: {
    width: 36,
    height: 36,
  },
  itemLabel: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 8,
    marginTop: 4,
  },
});