import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { PixelButton } from '../components/PixelButton';
import { PixelInput } from '../components/PixelInput';
import { supabase } from '../utils/supabase';

export const OnboardingScreen = () => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [partnerUUID, setPartnerUUID] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        Alert.alert('Success', 'Logged in!');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        Alert.alert('Success', 'Account created! Please check your email.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLinkPartner = async () => {
    if (!partnerUUID) {
      Alert.alert('Error', 'Please enter partner UUID');
      return;
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Please log in first');
        return;
      }

      // Insert partner link
      const { error } = await supabase
        .from('partner_links')
        .insert({
          user_id: user.id,
          partner_id: partnerUUID,
        });

      if (error) throw error;
      Alert.alert('Success', 'Partner linked!');
      setPartnerUUID('');
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
      <Text
        style={[
          styles.title,
          { color: theme.text },
        ]}
      >
        Love Touch
      </Text>

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.text },
          ]}
        >
          {isLogin ? 'Login' : 'Register'}
        </Text>

        <PixelInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          style={styles.input}
        />

        <PixelInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          style={styles.input}
        />

        <PixelButton
          onPress={handleAuth}
          style={styles.button}
        >
          <Text
            style={[
              styles.buttonText,
              { color: theme.background },
            ]}
          >
            {isLogin ? 'Login' : 'Register'}
          </Text>
        </PixelButton>

        <PixelButton
          onPress={() => setIsLogin(!isLogin)}
          variant="secondary"
          style={styles.button}
        >
          <Text
            style={[
              styles.buttonText,
              { color: theme.text },
            ]}
          >
            {isLogin ? 'Create Account' : 'Have an account? Login'}
          </Text>
        </PixelButton>
      </View>

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.text },
          ]}
        >
          Link Partner
        </Text>

        <PixelInput
          value={partnerUUID}
          onChangeText={setPartnerUUID}
          placeholder="Enter Partner UUID"
          style={styles.input}
        />

        <PixelButton
          onPress={handleLinkPartner}
          style={styles.button}
        >
          <Text
            style={[
              styles.buttonText,
              { color: theme.background },
            ]}
          >
            Link Partner
          </Text>
        </PixelButton>
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
  title: {
    fontSize: 32,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
});
