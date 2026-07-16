import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Vibration,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../theme/ThemeContext';
import { supabase } from '../lib/supabase';

// Configurar notificaciones en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Corazones (0 a 4 toques)
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

  // ── Animaciones existentes ─────────────────────────────────────
  const heartBreath = useRef(new Animated.Value(1)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;
  const heartBounce = useRef(new Animated.Value(1)).current;
  const buttonBounce = useRef(new Animated.Value(1)).current;

  // ── Toast retro ────────────────────────────────────────────────
  const [toastMsg, setToastMsg] = useState(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimeout = useRef(null);

  const showRetroToast = (message, icon = '💖') => {
    // Limpiar timeout anterior
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToastMsg({ message, icon });
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
    toastTimeout.current = setTimeout(() => {
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToastMsg(null));
    }, 3000);
  };

  // ── Supabase: canal y couple_id ───────────────────────────────
  const channelRef = useRef(null);
  const [coupleId, setCoupleId] = useState(null);

  useEffect(() => {
    const getCoupleId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('couple_id')
        .eq('id', user.id)
        .single();
      if (profile?.couple_id) setCoupleId(profile.couple_id);
    };
    getCoupleId();
  }, []);

  useEffect(() => {
    if (!coupleId) return;

    const channel = supabase.channel(`couple_touches:${coupleId}`, {
      config: { broadcast: { self: true } },
    });

    channel.on('broadcast', { event: 'touch_received' }, async () => {
      // Doble zumbido retro
      Vibration.vibrate([0, 150, 100, 150]);
      // Notificación del sistema
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '¡Zumbido de Amor! ⚡️',
          body: 'Tu pareja te ha enviado un toque',
        },
        trigger: null,
      });
      // Toast en pantalla
      showRetroToast('¡Tu pareja te envió un toque! ⚡️');
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId]);

  // ── Envío de toque ────────────────────────────────────────────
  const sendTouch = async () => {
    if (!coupleId || !channelRef.current) return;

    // Doble zumbido local (el emisor también lo siente)
    Vibration.vibrate([0, 150, 100, 150]);

    // Enviar broadcast
    await channelRef.current.send({
      type: 'broadcast',
      event: 'touch_received',
      payload: {},
    });

    // Incrementar contador en BD
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('touches')
          .eq('id', user.id)
          .single();
        const newTouches = (profile?.touches || 0) + 1;
        await supabase
          .from('profiles')
          .update({ touches: newTouches })
          .eq('id', user.id);
      }
    } catch (error) {
      console.warn('No se pudo actualizar el contador de toques:', error);
    }

    showRetroToast('¡Toque enviado! 💖');
  };

  // ── Animación continua ────────────────────────────────────────
  useEffect(() => {
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

  // ── Heart pop cuando suben los touches ─────────────────────────
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

  // ── Botón principal ───────────────────────────────────────────
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

    sendTouch();
  };

  const heartIndex = Math.min(touchesToday, 4);
  const heartScale = Animated.multiply(heartBreath, heartBounce);
  const buttonScale = Animated.multiply(buttonPulse, buttonBounce);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Toast retro */}
      {toastMsg && (
        <Animated.View
          style={[
            styles.retroToast,
            {
              opacity: toastOpacity,
              borderColor: theme.border,
              backgroundColor: theme.cardBackground,
            },
          ]}
        >
          <Text style={[styles.toastText, { color: theme.textPrimary }]}>
            {toastMsg.icon}  {toastMsg.message}
          </Text>
        </Animated.View>
      )}

      {/* Contenido original */}
      <Text style={[styles.title, { color: theme.textPrimary }]}>TOUCH</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        SI EXTRAÑAS A TU PAREJA
      </Text>

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

      <View style={[styles.statusContainer, { borderColor: theme.border }]}>
        <Text style={[styles.statusText, { color: theme.textPrimary }]}>
          TOQUES DE AMOR: {touchesToday}
        </Text>
      </View>

      {/* Botón de prueba temporal */}
      <TouchableOpacity
        style={[styles.testBuzzButton, { borderColor: theme.border }]}
        onPress={() => Vibration.vibrate([0, 150, 100, 150])}
      >
        <Text style={[styles.testBuzzText, { color: theme.textSecondary }]}>
          TEST BUZZ
        </Text>
      </TouchableOpacity>
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
  retroToast: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    borderWidth: 3,
    padding: 12,
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 4,
  },
  toastText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 10,
    textAlign: 'center',
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
    marginBottom: 15,
  },
  statusText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 11,
  },
  testBuzzButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderRadius: 4,
  },
  testBuzzText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 10,
  },
});