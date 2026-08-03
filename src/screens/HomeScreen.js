import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Vibration,
  Platform,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useTheme } from '../theme/ThemeContext';
import { supabase } from '../lib/supabase';

// El handler global de notificaciones y el canal de Android se configuran
// de forma centralizada en src/lib/notifications.js (llamado desde App.js).

// Corazones (0 a 4 toques)
const heartImages = [
  require('../../assets/heart_0.png'),
  require('../../assets/heart_1.png'),
  require('../../assets/heart_2.png'),
  require('../../assets/heart_3.png'),
  require('../../assets/heart_4.png'),
];

// ─── Función de registro de notificaciones push ─────────────────
const registerForPushNotificationsAsync = async () => {
  if (!Device.isDevice) {
    Alert.alert(
      'Dispositivo no físico',
      'Las notificaciones push solo funcionan en dispositivos reales.'
    );
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permiso denegado',
        'No se concedió permiso para recibir notificaciones.'
      );
      return null;
    }

    // Configuración del canal para Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 150, 100, 150],
        lightColor: '#FF69B4',
      });
    }

    // ── Extracción segura del projectId (corregida) ─────────────
    const projectId = 
      Constants?.expoConfig?.extra?.eas?.projectId ?? 
      Constants?.easConfig?.projectId;

    if (!projectId) {
      Alert.alert(
        'Falta Project ID',
        'No se encontró el ID del proyecto de Expo. Ejecuta "npx eas init" en tu terminal.'
      );
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    return tokenData.data;
  } catch (error) {
    Alert.alert('Error Push Token', error.message);
    console.error('registerForPushNotificationsAsync error:', error);
    return null;
  }
};

const HomeScreen = () => {
  const { theme } = useTheme();
  const [touchesCount, setTouchesCount] = useState(0);

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

  // Obtener couple_id fresco cada vez que la pantalla obtiene el foco
  useFocusEffect(
    useCallback(() => {
      const getCoupleId = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase
          .from('profiles')
          .select('couple_id, touches')
          .eq('id', user.id)
          .single();
        if (profile?.couple_id) {
          setCoupleId(profile.couple_id);
        }
        setTouchesCount(profile?.touches || 0);
      };
      getCoupleId();
    }, [])
  );

  // Suscribirse al canal cuando cambie coupleId
  useEffect(() => {
    if (!coupleId) return;

    const channel = supabase.channel(`couple_touches:${coupleId}`, {
      config: { broadcast: { self: false } },
    });

    channel.on('broadcast', { event: 'touch_received' }, async () => {
      Vibration.vibrate([0, 150, 100, 150]);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '¡Zumbido de Amor! ⚡️',
          body: 'Tu pareja te ha enviado un toque',
        },
        trigger: null,
      });
      showRetroToast('¡Tu pareja te envió un toque! ⚡️');
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId]);

  // ── Registrar token push y guardarlo en Supabase ─────────────
  useEffect(() => {
    const setupPushToken = async () => {
      const token = await registerForPushNotificationsAsync();
      if (!token) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          Alert.alert('Error', 'No se pudo obtener el usuario autenticado.');
          return;
        }

        const { error } = await supabase
          .from('profiles')
          .update({ push_token: token })
          .eq('id', user.id);

        if (error) {
          Alert.alert('Error Supabase', error.message);
          console.error('Error al guardar push_token:', error);
        } else {
          Alert.alert(
            'Éxito',
            `Token guardado en BD: ${token.substring(0, 10)}...`
          );
        }
      } catch (catchError) {
        Alert.alert('Error inesperado', catchError.message || 'Error al guardar token');
        console.error('setupPushToken error:', catchError);
      }
    };

    setupPushToken();
  }, []);

  // ── Envío de toque ────────────────────────────────────────────
  const sendTouch = async () => {
    if (!coupleId || !channelRef.current) return;

    Vibration.vibrate([0, 150, 100, 150]);

    await channelRef.current.send({
      type: 'broadcast',
      event: 'touch_received',
      payload: {},
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Actualizar contador de toques del emisor
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
        setTouchesCount(newTouches);

        // Obtener el token push de la pareja
        const { data: partnerProfile } = await supabase
          .from('profiles')
          .select('id, push_token')
          .eq('couple_id', coupleId)
          .neq('id', user.id)
          .maybeSingle();

        if (partnerProfile?.push_token) {
          // Enviar notificación push a la pareja via Expo
          await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: partnerProfile.push_token,
              title: '¡Zumbido de Amor! ⚡️',
              body: 'Tu pareja te ha enviado un toque 💖',
              sound: 'default',
              priority: 'high',
            }),
          });
        }
      }
    } catch (error) {
      console.warn('sendTouch error:', error);
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
    if (touchesCount === 0) return;
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
  }, [touchesCount]);

  // ── Botón principal ───────────────────────────────────────────
  const handleSendLove = () => {
    setTouchesCount(prev => prev + 1);

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

  const heartIndex = Math.min(touchesCount, 4);
  const heartScale = Animated.multiply(heartBreath, heartBounce);
  const buttonScale = Animated.multiply(buttonPulse, buttonBounce);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
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
          TOQUES DE AMOR: {touchesCount}
        </Text>
      </View>

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