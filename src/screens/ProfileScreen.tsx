import React from 'react';
import { StyleSheet, View, Text, ScrollView, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { PixelButton } from '../components/PixelButton';
import { ThemeSwatch } from '../components/ThemeSwatch';
import { ThemeName, themes } from '../theme/colors';
import { supabase } from '../utils/supabase';

export const ProfileScreen = () => {
  const { theme, themeName, setTheme } = useTheme();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      Alert.alert('Success', 'Logged out!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
      contentContainerStyle={styles.contentContainer}
    >
      <View
        style={[
          styles.profileHeader,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text
          style={[
            styles.profileName,
            { color: theme.text },
          ]}
        >
          User Profile
        </Text>
        <Text
          style={[
            styles.profileEmail,
            { color: theme.textMuted },
          ]}
        >
          user@example.com
        </Text>
      </View>

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.text },
          ]}
        >
          Theme Customization
        </Text>
        <Text
          style={[
            styles.sectionDescription,
            { color: theme.textMuted },
          ]}
        >
          Select a color palette to change the app theme
        </Text>

        <View style={styles.themeGrid}>
          {(Object.keys(themes) as ThemeName[]).map((name) => (
            <ThemeSwatch
              key={name}
              themeName={name}
              isSelected={themeName === name}
              onSelect={setTheme}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.text },
          ]}
        >
          Account
        </Text>

        <PixelButton
          onPress={() => Alert.alert('Info', 'Partner linking is done on the Onboarding screen')}
          variant="secondary"
          style={styles.accountButton}
        >
          <Text
            style={[
              styles.buttonText,
              { color: theme.text },
            ]}
          >
            Manage Partner Link
          </Text>
        </PixelButton>

        <PixelButton
          onPress={handleLogout}
          variant="danger"
          style={styles.accountButton}
        >
          <Text
            style={[
              styles.buttonText,
              { color: theme.background },
            ]}
          >
            Logout
          </Text>
        </PixelButton>
      </View>

      <View style={styles.footer}>
        <Text
          style={[
            styles.footerText,
            { color: theme.textMuted },
          ]}
        >
          Love Touch v1.0.0
        </Text>
        <Text
          style={[
            styles.footerText,
            { color: theme.textMuted },
          ]}
        >
          Made with 8-bit love
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  profileHeader: {
    borderWidth: 4,
    borderStyle: 'solid',
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  profileName: {
    fontSize: 24,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  accountButton: {
    marginTop: 12,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 24,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
});
