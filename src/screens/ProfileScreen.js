import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { supabase } from '../lib/supabase';
import { linkPartner } from '../lib/pairing';

const gearIcon = require('../../assets/ggear.png');

const AVATAR_PRESETS = ['👤', '🐶', '🐱', '🐸', '🐼'];

// Formatea una fecha local como 'YYYY-MM-DD'
const fmtLocalDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Calcula la racha de días consecutivos con actividad registrada (hasta hoy o ayer)
const computeStreak = (loggedDates) => {
  const set = new Set(loggedDates);
  const cursor = new Date();
  // Si aún no se registró hoy, la racha puede seguir viva si se registró ayer
  if (!set.has(fmtLocalDate(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (set.has(fmtLocalDate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { theme, activeThemeKey, setActiveThemeKey, themes } = useTheme();

  // ── Perfil ──────────────────────────────────────────────────────
  const [profile, setProfile] = useState(null);
  const [partnerName, setPartnerName] = useState('...');
  const [loadingProfile, setLoadingProfile] = useState(true);

  // ── Estadísticas reales ────────────────────────────────────────
  const [touches, setTouches] = useState(0);
  const [streak, setStreak] = useState(0);

  // ── Modal ──────────────────────────────────────────────────────
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [partnerCode, setPartnerCode] = useState('');
  const [linking, setLinking] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Guardar tema ──────────────────────────────────────────────
  const [savedThemeKey, setSavedThemeKey] = useState(null);
  const [savingTheme, setSavingTheme] = useState(false);

  // ── Toast retro ────────────────────────────────────────────────
  const [toastMsg, setToastMsg] = useState(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimeout = useRef(null);

  const showRetroToast = (message, icon = '⭐') => {
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

  // ── Cargar perfil ──────────────────────────────────────────────
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoadingProfile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigation.getParent()?.replace('Auth');
        return;
      }
      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(userProfile);
      setTouches(userProfile.touches || 0);

      // Racha real: días consecutivos con al menos un registro de hábito
      const { data: logs } = await supabase
        .from('tracker_logs')
        .select('date, intensity')
        .eq('user_id', user.id);
      const loggedDates = (logs || [])
        .filter((l) => (l.intensity || 0) > 0)
        .map((l) => l.date);
      setStreak(computeStreak(loggedDates));

      const matchingTheme = Object.keys(themes).find(
        key => themes[key].primary === userProfile.base_color
      );
      setSavedThemeKey(matchingTheme || 'Royal Purple');

      setEditUsername(userProfile.username || '');
      setEditAvatar(userProfile.avatar_url || '👤');

      if (userProfile.partner_id) {
        const { data: partner } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', userProfile.partner_id)
          .single();
        setPartnerName(partner?.username || 'PARTNER');
      }
    } catch (err) {
      console.error('Load profile error:', err);
      showRetroToast('Error al cargar el perfil', '❌');
    } finally {
      setLoadingProfile(false);
    }
  };

  // ── Tema ──────────────────────────────────────────────────────
  const handleThemeChange = (themeKey) => {
    setActiveThemeKey(themeKey);
  };

  const handleSaveTheme = async () => {
    if (!profile) return;
    setSavingTheme(true);
    try {
      const newPrimary = themes[activeThemeKey].primary;
      const { error } = await supabase
        .from('profiles')
        .update({ base_color: newPrimary })
        .eq('id', profile.id);
      if (error) throw error;
      setSavedThemeKey(activeThemeKey);
      showRetroToast('¡Tema guardado! 🎨');
    } catch (err) {
      showRetroToast('Error al guardar el tema', '❌');
    } finally {
      setSavingTheme(false);
    }
  };

  // ── Modal: Guardar perfil ─────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!profile || !editUsername.trim()) {
      showRetroToast('El nombre de usuario no puede estar vacío', '⚠️');
      return;
    }
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editUsername.trim(),
          avatar_url: editAvatar,
        })
        .eq('id', profile.id);
      if (error) throw error;
      setProfile(prev => ({ ...prev, username: editUsername.trim(), avatar_url: editAvatar }));
      showRetroToast('¡Perfil actualizado! 💾');
      setIsSettingsVisible(false);
    } catch (err) {
      showRetroToast('Error al actualizar el perfil', '❌');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.getParent()?.replace('Auth');
  };

  const handleCopyCode = async () => {
    if (profile?.pairing_code) {
      await Clipboard.setStringAsync(profile.pairing_code);
      showRetroToast('¡Código copiado! 📋');
    }
  };

  const handleLinkPartner = async () => {
    if (!partnerCode.trim() || !profile) return;
    setLinking(true);
    const result = await linkPartner(profile.id, partnerCode.trim());
    if (result.success) {
      showRetroToast('¡Vinculado con tu pareja! 💞');
      loadProfile();
      setIsSettingsVisible(false);
    } else {
      showRetroToast(result.error || 'Error al vincular', '❌');
    }
    setLinking(false);
  };

  // ── Tarjeta de tema ───────────────────────────────────────────
  const renderThemeCard = (themeKey) => {
    const palette = themes[themeKey];
    const isSelected = themeKey === activeThemeKey;
    return (
      <TouchableOpacity
        key={themeKey}
        style={[
          styles.themeCard,
          {
            backgroundColor: palette.cardBackground,
            borderColor: palette.primary,
            borderWidth: isSelected ? 3 : 2,
          },
        ]}
        onPress={() => handleThemeChange(themeKey)}
        activeOpacity={0.7}
      >
        <View style={[styles.colorPreview, { backgroundColor: palette.primary }]} />
        <Text style={[styles.themeName, { color: palette.textPrimary }]} numberOfLines={1}>
          {themeKey}
        </Text>
      </TouchableOpacity>
    );
  };

  // ── Pantalla de carga ─────────────────────────────────────────
  if (loadingProfile) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.primary }]}>LOADING DATA...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
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

      <SafeAreaView style={styles.gearContainer}>
        <TouchableOpacity onPress={() => setIsSettingsVisible(true)} activeOpacity={0.7}>
          <Image source={gearIcon} style={styles.gearImage} resizeMode="contain" />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={[styles.avatar, { borderColor: theme.primary }]}>
            <Text style={styles.avatarEmoji}>{profile?.avatar_url || '👤'}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.playerName, { color: theme.primary }]}>
              {profile?.username || 'PLAYER_ONE'}
            </Text>
            <Text style={[styles.level, { color: theme.textSecondary }]}>
              LV. {Math.floor(touches / 10) + 1}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.statValue, { color: theme.primary }]}>{touches}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Touches</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.statValue, { color: theme.primary }]}>{streak}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Streak</Text>
          </View>
        </View>

        {/* Partner */}
        <View style={[styles.partnerBox, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.partnerTitle, { color: theme.primary }]}>LINKED WITH</Text>
          <Text style={[styles.partnerName, { color: theme.textPrimary }]}>
            {profile?.partner_id ? `♥ ${partnerName} ♥` : 'No partner linked'}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.primary }]}>THEME COLORS</Text>
        <View style={styles.themeGrid}>
          {Object.keys(themes).map(renderThemeCard)}
        </View>

        {savedThemeKey && activeThemeKey !== savedThemeKey && (
          <TouchableOpacity
            style={[styles.saveThemeButton, { backgroundColor: theme.primary }]}
            onPress={handleSaveTheme}
            disabled={savingTheme}
          >
            {savingTheme ? (
              <ActivityIndicator color={theme.headerTint} />
            ) : (
              <Text style={[styles.saveThemeButtonText, { color: theme.headerTint }]}>
                GUARDAR TEMA
              </Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Modal de ajustes */}
      <Modal
        visible={isSettingsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSettingsVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <ScrollView
            contentContainerStyle={styles.modalScroll}
            style={[styles.modalBox, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          >
            <Text style={[styles.modalTitle, { color: theme.primary }]}>AJUSTES</Text>

            <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>USERNAME</Text>
            <TextInput
              style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
              value={editUsername}
              onChangeText={setEditUsername}
              fontFamily="PressStart2P-Regular"
            />

            <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>AVATAR</Text>
            <View style={styles.avatarRow}>
              {AVATAR_PRESETS.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.avatarOption, { borderColor: editAvatar === emoji ? theme.primary : theme.border }]}
                  onPress={() => setEditAvatar(emoji)}
                >
                  <Text style={styles.avatarEmojiSmall}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.input, { color: theme.textPrimary, borderColor: theme.border, marginTop: 8 }]}
              placeholder="or enter image URL"
              placeholderTextColor={theme.textSecondary}
              value={editAvatar}
              onChangeText={setEditAvatar}
              fontFamily="PressStart2P-Regular"
            />

            <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>PAIRING CODE</Text>
            <View style={styles.codeRow}>
              <Text style={[styles.codeText, { color: theme.primary }]}>
                {profile?.pairing_code || '------'}
              </Text>
              <TouchableOpacity onPress={handleCopyCode} style={styles.copyButton}>
                <Text style={[styles.copyButtonText, { color: theme.headerTint }]}>COPY</Text>
              </TouchableOpacity>
            </View>

            {!profile?.partner_id ? (
              <>
                <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>LINK PARTNER</Text>
                <TextInput
                  style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
                  placeholder="Partner's code"
                  placeholderTextColor={theme.textSecondary}
                  value={partnerCode}
                  onChangeText={setPartnerCode}
                  maxLength={6}
                  autoCapitalize="characters"
                  fontFamily="PressStart2P-Regular"
                />
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.primary }]}
                  onPress={handleLinkPartner}
                  disabled={linking}
                >
                  {linking ? (
                    <ActivityIndicator color={theme.headerTint} />
                  ) : (
                    <Text style={[styles.modalButtonText, { color: theme.headerTint }]}>LINK</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <Text style={[styles.linkedMessage, { color: theme.textSecondary }]}>
                ✓ Linked successfully
              </Text>
            )}

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.primary, marginTop: 20 }]}
              onPress={handleSaveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? (
                <ActivityIndicator color={theme.headerTint} />
              ) : (
                <Text style={[styles.modalButtonText, { color: theme.headerTint }]}>SAVE & CONFIRM</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={[styles.logoutText, { color: '#FF4444' }]}>CERRAR SESIÓN</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={() => setIsSettingsVisible(false)}>
              <Text style={[styles.closeButtonText, { color: theme.textSecondary }]}>CLOSE</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;

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
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  gearContainer: { position: 'absolute', top: 20, right: 20, zIndex: 10 },
  gearImage: { width: 68, height: 68 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  avatar: { width: 70, height: 70, borderRadius: 10, borderWidth: 3, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarEmoji: { fontSize: 36 },
  headerText: { flex: 1 },
  playerName: { fontFamily: 'PressStart2P-Regular', fontSize: 16, marginBottom: 4 },
  level: { fontFamily: 'PressStart2P-Regular', fontSize: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { flex: 1, borderWidth: 2, paddingVertical: 15, alignItems: 'center', marginHorizontal: 5, borderRadius: 4 },
  statValue: { fontFamily: 'PressStart2P-Regular', fontSize: 22 },
  statLabel: { fontFamily: 'PressStart2P-Regular', fontSize: 10, marginTop: 5 },
  partnerBox: { borderWidth: 2, padding: 15, alignItems: 'center', marginBottom: 25, borderRadius: 4 },
  partnerTitle: { fontFamily: 'PressStart2P-Regular', fontSize: 12, marginBottom: 8 },
  partnerName: { fontFamily: 'PressStart2P-Regular', fontSize: 14 },
  sectionTitle: { fontFamily: 'PressStart2P-Regular', fontSize: 14, marginBottom: 15, textAlign: 'center' },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  themeCard: { width: '48%', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 10, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  colorPreview: { width: 20, height: 20, borderRadius: 4, marginRight: 10, borderWidth: 1, borderColor: '#000' },
  themeName: { fontFamily: 'PressStart2P-Regular', fontSize: 9, flexShrink: 1 },
  saveThemeButton: { marginTop: 20, paddingVertical: 14, borderWidth: 3, borderColor: '#000', alignItems: 'center', marginHorizontal: 20 },
  saveThemeButtonText: { fontFamily: 'PressStart2P-Regular', fontSize: 14 },
  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '85%', borderWidth: 4, borderRadius: 8, maxHeight: '85%' },
  modalScroll: { padding: 20, alignItems: 'center' },
  modalTitle: { fontFamily: 'PressStart2P-Regular', fontSize: 16, marginBottom: 20 },
  inputLabel: { fontFamily: 'PressStart2P-Regular', fontSize: 11, marginBottom: 4, alignSelf: 'flex-start' },
  input: { fontFamily: 'PressStart2P-Regular', fontSize: 11, borderWidth: 2, paddingHorizontal: 10, paddingVertical: 10, marginBottom: 15, width: '100%' },
  avatarRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 10 },
  avatarOption: { width: 50, height: 50, borderWidth: 2, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  avatarEmojiSmall: { fontSize: 28 },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 15 },
  codeText: { fontFamily: 'PressStart2P-Regular', fontSize: 14, letterSpacing: 4 },
  copyButton: { backgroundColor: '#222', padding: 8, borderWidth: 2, borderColor: '#000' },
  copyButtonText: { fontFamily: 'PressStart2P-Regular', fontSize: 10 },
  linkedMessage: { fontFamily: 'PressStart2P-Regular', fontSize: 12, marginBottom: 15 },
  modalButton: { width: '100%', paddingVertical: 12, borderWidth: 3, borderColor: '#000', alignItems: 'center', marginBottom: 10 },
  modalButtonText: { fontFamily: 'PressStart2P-Regular', fontSize: 13 },
  logoutButton: { width: '100%', paddingVertical: 12, borderWidth: 3, borderColor: '#FF4444', alignItems: 'center', marginBottom: 15, marginTop: 5 },
  logoutText: { fontFamily: 'PressStart2P-Regular', fontSize: 12 },
  closeButton: { marginTop: 10, padding: 10 },
  closeButtonText: { fontFamily: 'PressStart2P-Regular', fontSize: 11 },
});