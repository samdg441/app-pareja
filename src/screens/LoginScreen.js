import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const LoginScreen = ({ navigation }) => {
  const { theme } = useTheme();   // uses active theme, defaults to Pink Love
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [partnerUsername, setPartnerUsername] = useState('');

  const handleStart = () => {
    // Navigate to main tabs
    navigation.replace('Main');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Heart image */}
        <Image
          source={require('../../assets/heart_4.png')}
          style={styles.heart}
          resizeMode="contain"
        />

        {/* Titles */}
        <Text style={[styles.title, { color: theme.textPrimary }]}>UNIR</Text>
        <Text style={[styles.title, { color: theme.textPrimary }]}>PAREJA</Text>

        {/* Login/Register Box */}
        <View style={[styles.box, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}>
          <TextInput
            style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
            placeholder="NOMBRE USUARIO"
            placeholderTextColor={theme.textSecondary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            fontFamily="PressStart2P-Regular"
          />
          <TextInput
            style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
            placeholder="CONTRASEÑA"
            placeholderTextColor={theme.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            fontFamily="PressStart2P-Regular"
          />
        </View>

        {/* Link Partner Box */}
        <View style={[styles.box, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}>
          <TextInput
            style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
            placeholder="NOMBRE PAREJA"
            placeholderTextColor={theme.textSecondary}
            value={partnerUsername}
            onChangeText={setPartnerUsername}
            autoCapitalize="none"
            fontFamily="PressStart2P-Regular"
          />
          <TouchableOpacity style={[styles.connectButton, { backgroundColor: theme.primary }]}>
            <Text style={[styles.connectButtonText, { color: theme.headerTint }]}>UNIRSE</Text>
          </TouchableOpacity>
        </View>

        {/* START button */}
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: theme.primary }]}
          onPress={handleStart}
          activeOpacity={0.8}
        >
          <Text style={[styles.startButtonText, { color: theme.headerTint }]}>START!</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  heart: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 6,
  },
  box: {
    width: '100%',
    borderWidth: 3,
    borderRadius: 4,
    padding: 15,
    marginVertical: 12,
  },
  input: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 11,
    borderWidth: 2,
    borderRadius: 0,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  connectButton: {
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
  },
  connectButtonText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 12,
  },
  startButton: {
    width: '100%',
    paddingVertical: 16,
    borderWidth: 4,
    borderColor: '#000',
    alignItems: 'center',
    marginTop: 25,
  },
  startButtonText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 16,
  },
});