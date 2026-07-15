import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { supabase } from '../lib/supabase';
import { linkPartner } from '../lib/pairing';

const gearIcon = require('../../assets/ggear.png');

// Simple retro avatar presets (emoji or local images)
const AVATAR_PRESETS = ['👤', '🐶', '🐱', '🐸', '🐼'];

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { theme, activeThemeKey, setActiveThemeKey, themes } = useTheme();

  // ── Profile data state ─────────────────────────────────────────
  const [profile, setProfile] = useState(null);
  const [partnerName, setPartnerName] = useState('...');
  const [loadingProfile, setLoadingProfile] = useState(true);

  // ── Settings modal state ───────────────────────────────────────
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  // Form fields for profile editing (inside modal)
  const [editUsername, setEditUsername] = useState('');
  const [editAvatar, setEditAvatar] = useState('');  // emoji or URL string
  const [partnerCode, setPartnerCode] = useState('');
  const [linking, setLinking] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Save‑theme button state ───────────────────────────────────
  const [savedThemeKey, setSavedThemeKey] = useState(null); // from Supabase
  const [savingTheme, setSavingTheme] = useState(false);

  // ── Fetch user & profile data on mount ────────────────────────
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

      // Set saved theme from base_color (map to theme key)
      const matchingTheme = Object.keys(themes).find(
        key => themes[key].primary === userProfile.base_color
      );
      setSavedThemeKey(matchingTheme || 'Royal Purple');

      // Pre‑fill edit fields
      setEditUsername(userProfile.username || '');
      setEditAvatar(userProfile.avatar_url || '👤');

      // Fetch partner name if linked
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
      Alert.alert('Error', 'Could not load profile.');
    } finally {
      setLoadingProfile(false);
    }
  };

  // ── Theme change handler (instant preview) ────────────────────
  const handleThemeChange = (themeKey) => {
    setActiveThemeKey(themeKey);
  };

  // ── Save theme to Supabase ────────────────────────────────────
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
      Alert.alert('Theme saved', 'Your color theme has been saved.');
    } catch (err) {
      Alert.alert('Error', 'Failed to save theme.');
    } finally {
      setSavingTheme(false);
    }
  };

  // ── Modal actions ─────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!profile || !editUsername.trim()) {
      Alert.alert('Error', 'Username cannot be empty.');
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
      // Update local state
      setProfile(prev => ({ ...prev, username: editUsername.trim(), avatar_url: editAvatar }));
      Alert.alert('Profile updated', 'Your changes have been saved.');
      setIsSettingsVisible(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile.');
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
      Alert.alert('Copied', 'Pairing code copied to clipboard.');
    }
  };

  const handleLinkPartner = async () => {
    if (!partnerCode.trim() || !profile) return;
    setLinking(true);
    const result = await linkPartner(profile.id, partnerCode.trim());
    if (result.success) {
      Alert.alert('Linked!', 'You are now connected with your partner.', [
        { text: 'OK', onPress: () => { loadProfile(); setIsSettingsVisible(false); } }
      ]);
    } else {
      Alert.alert('Error', result.error);
    }
    setLinking(false);
  };

  // ── Theme cards (reused) ──────────────────────────────────────
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

  // ── Loading state ─────────────────────────────────────────────
  if (loadingProfile) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.primary }]}>LOADING DATA...</Text>
      </View>
    );
  }

  // ── Main render ───────────────────────────────────────────────
  return (
    <View style={{ flex: 1 }}>
      {/* Gear icon */}
      <SafeAreaView style={styles.gearContainer}>
        <TouchableOpacity onPress={() => setIsSettingsVisible(true)} activeOpacity={0.7}>
          <Image source={gearIcon} style={styles.gearImage} resizeMode="contain" />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
      >
        {/* Header: avatar + name + level */}
        <View style={styles.headerRow}>
          <View style={[styles.avatar, { borderColor: theme.primary }]}>
            <Text style={styles.avatarEmoji}>
              {profile?.avatar_url || '👤'}
            </Text>
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.playerName, { color: theme.primary }]}>
              {profile?.username || 'PLAYER_ONE'}
            </Text>
            <Text style={[styles.level, { color: theme.textSecondary }]}>LV. 42</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.statValue, { color: theme.primary }]}>127</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Touches</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.statValue, { color: theme.primary }]}>42</Text>
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

        {/* Theme colors title */}
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>THEME COLORS</Text>
        <View style={styles.themeGrid}>
          {Object.keys(themes).map(renderThemeCard)}
        </View>

        {/* Save theme button if changed */}
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

      {/* ─── Settings Modal ──────────────────────────────────────── */}
      <Modal
        visible={isSettingsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSettingsVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <ScrollView
            contentContainerStyle={styles.modalScroll}
            style={[
              styles.modalBox,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.primary }]}>AJUSTES</Text>

            {/* Username */}
            <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>USERNAME</Text>
            <TextInput
              style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
              value={editUsername}
              onChangeText={setEditUsername}
              fontFamily="PressStart2P-Regular"
            />

            {/* Avatar selection */}
            <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>AVATAR</Text>
            <View style={styles.avatarRow}>
              {AVATAR_PRESETS.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.avatarOption,
                    { borderColor: editAvatar === emoji ? theme.primary : theme.border },
                  ]}
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

            {/* Pairing code */}
            <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>PAIRING CODE</Text>
            <View style={styles.codeRow}>
              <Text style={[styles.codeText, { color: theme.primary }]}>
                {profile?.pairing_code || '------'}
              </Text>
              <TouchableOpacity onPress={handleCopyCode} style={styles.copyButton}>
                <Text style={[styles.copyButtonText, { color: theme.headerTint }]}>COPY</Text>
              </TouchableOpacity>
            </View>

            {/* Link partner (only if not linked) */}
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

            {/* Save & Confirm */}
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

            {/* Logout */}
            <TouchableOpacity
              style={[styles.logoutButton]}
              onPress={handleLogout}
            >
              <Text style={[styles.logoutText, { color: '#FF4444' }]}>CERRAR SESIÓN</Text>
            </TouchableOpacity>

            {/* Close */}
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

// ─── Styles ──────────────────────────────────────────────────────
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
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  gearContainer: { position: 'absolute', top: 20, right: 20, zIndex: 10 },
  gearImage: { width: 68, height: 68 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  avatar: {
    width: 70, height: 70, borderRadius: 10, borderWidth: 3,
    justifyContent: 'center', alignItems: 'center', marginRight: 15,
  },
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
  themeCard: {
    width: '48%', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 10,
    marginBottom: 12, flexDirection: 'row', alignItems: 'center',
  },
  colorPreview: { width: 20, height: 20, borderRadius: 4, marginRight: 10, borderWidth: 1, borderColor: '#000' },
  themeName: { fontFamily: 'PressStart2P-Regular', fontSize: 9, flexShrink: 1 },
  saveThemeButton: {
    marginTop: 20, paddingVertical: 14, borderWidth: 3, borderColor: '#000',
    alignItems: 'center', marginHorizontal: 20,
  },
  saveThemeButtonText: { fontFamily: 'PressStart2P-Regular', fontSize: 14 },
  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalBox: {
    width: '85%', borderWidth: 4, borderRadius: 8, maxHeight: '85%',
  },
  modalScroll: { padding: 20, alignItems: 'center' },
  modalTitle: { fontFamily: 'PressStart2P-Regular', fontSize: 16, marginBottom: 20 },
  inputLabel: { fontFamily: 'PressStart2P-Regular', fontSize: 11, marginBottom: 4, alignSelf: 'flex-start' },
  input: {
    fontFamily: 'PressStart2P-Regular', fontSize: 11, borderWidth: 2,
    paddingHorizontal: 10, paddingVertical: 10, marginBottom: 15, width: '100%',
  },
  avatarRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 10 },
  avatarOption: { width: 50, height: 50, borderWidth: 2, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  avatarEmojiSmall: { fontSize: 28 },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 15 },
  codeText: { fontFamily: 'PressStart2P-Regular', fontSize: 14, letterSpacing: 4 },
  copyButton: { backgroundColor: '#222', padding: 8, borderWidth: 2, borderColor: '#000' },
  copyButtonText: { fontFamily: 'PressStart2P-Regular', fontSize: 10 },
  linkedMessage: { fontFamily: 'PressStart2P-Regular', fontSize: 12, marginBottom: 15 },
  modalButton: {
    width: '100%', paddingVertical: 12, borderWidth: 3, borderColor: '#000',
    alignItems: 'center', marginBottom: 10,
  },
  modalButtonText: { fontFamily: 'PressStart2P-Regular', fontSize: 13 },
  logoutButton: {
    width: '100%', paddingVertical: 12, borderWidth: 3, borderColor: '#FF4444',
    alignItems: 'center', marginBottom: 15, marginTop: 5,
  },
  logoutText: { fontFamily: 'PressStart2P-Regular', fontSize: 12 },
  closeButton: { marginTop: 10, padding: 10 },
  closeButtonText: { fontFamily: 'PressStart2P-Regular', fontSize: 11 },
});