import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const gearIcon = require('../../assets/ggear.png');

const ProfileScreen = () => {
  const { theme, activeThemeKey, setActiveThemeKey, themes } = useTheme();
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  // ── Theme card render (unchanged) ───────────────────────────────
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
        onPress={() => setActiveThemeKey(themeKey)}
        activeOpacity={0.7}
      >
        <View style={[styles.colorPreview, { backgroundColor: palette.primary }]} />
        <Text
          style={[styles.themeName, { color: palette.textPrimary }]}
          numberOfLines={1}
        >
          {themeKey}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Gear icon – absolute positioned top right */}
      <SafeAreaView style={styles.gearContainer}>
        <TouchableOpacity
          onPress={() => setIsSettingsVisible(true)}
          activeOpacity={0.7}
        >
          <Image
            source={gearIcon}
            style={styles.gearImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Main scroll content (unchanged) */}
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={[styles.avatar, { borderColor: theme.primary }]}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.playerName, { color: theme.primary }]}>
              PLAYER_ONE
            </Text>
            <Text style={[styles.level, { color: theme.textSecondary }]}>
              LV. 42
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.cardBackground, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.statValue, { color: theme.primary }]}>127</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Touches
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.cardBackground, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.statValue, { color: theme.primary }]}>42</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Streak
            </Text>
          </View>
        </View>

        {/* Partner */}
        <View
          style={[
            styles.partnerBox,
            { backgroundColor: theme.cardBackground, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.partnerTitle, { color: theme.primary }]}>
            LINKED WITH
          </Text>
          <Text style={[styles.partnerName, { color: theme.textPrimary }]}>
            ♥ PARTNER_TWO ♥
          </Text>
        </View>

        {/* Theme selector header */}
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>
          THEME COLORS
        </Text>

        {/* 2‑column grid */}
        <View style={styles.themeGrid}>
          {Object.keys(themes).map(renderThemeCard)}
        </View>
      </ScrollView>

      {/* ─── Settings Modal ──────────────────────────────────────────── */}
      <Modal
        visible={isSettingsVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSettingsVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalBox,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.primary }]}>
              SETTINGS
            </Text>

            {/* Arcade buttons */}
            <TouchableOpacity
              style={[styles.arcadeButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                // handle EDIT PROFILE
                setIsSettingsVisible(false);
              }}
            >
              <Text style={[styles.arcadeButtonText, { color: theme.headerTint }]}>
                EDIT PROFILE
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.arcadeButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                // handle CHANGE AVATAR
                setIsSettingsVisible(false);
              }}
            >
              <Text style={[styles.arcadeButtonText, { color: theme.headerTint }]}>
                CHANGE AVATAR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.arcadeButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                // handle LOGOUT
                setIsSettingsVisible(false);
              }}
            >
              <Text style={[styles.arcadeButtonText, { color: theme.headerTint }]}>
                LOGOUT
              </Text>
            </TouchableOpacity>

            {/* Simple CLOSE button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsSettingsVisible(false)}
            >
              <Text style={[styles.closeButtonText, { color: theme.textSecondary }]}>
                CLOSE
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  // Gear icon
  gearContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10, // above the scroll
  },
  gearImage: {
    width: 68,
    height: 68,
  },
  // Existing styles
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 10,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarEmoji: {
    fontSize: 36,
  },
  headerText: {
    flex: 1,
  },
  playerName: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 16,
    marginBottom: 4,
  },
  level: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderWidth: 2,
    paddingVertical: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 4,
  },
  statValue: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 22,
  },
  statLabel: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 10,
    marginTop: 5,
  },
  partnerBox: {
    borderWidth: 2,
    padding: 15,
    alignItems: 'center',
    marginBottom: 25,
    borderRadius: 4,
  },
  partnerTitle: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 12,
    marginBottom: 8,
  },
  partnerName: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 14,
  },
  sectionTitle: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeCard: {
    width: '48%',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#000',
  },
  themeName: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 9,
    flexShrink: 1,
  },
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    borderWidth: 4,
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 16,
    marginBottom: 25,
  },
  arcadeButton: {
    width: '100%',
    paddingVertical: 14,
    borderWidth: 3,
    borderColor: '#000',
    marginBottom: 15,
    alignItems: 'center',
  },
  arcadeButtonText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 12,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
  },
  closeButtonText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 11,
  },
});