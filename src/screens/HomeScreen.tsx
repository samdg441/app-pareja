import React, { useState } from 'react';
import { StyleSheet, View, Text, Vibration, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { PixelHeart } from '../components/PixelHeart';
import { supabase } from '../utils/supabase';

type HeartState = 'empty' | 'loading' | 'full';

export const HomeScreen = () => {
  const { theme } = useTheme();
  const [heartState, setHeartState] = useState<HeartState>('empty');

  const sendTouch = async () => {
    if (heartState === 'loading') return;

    // Set loading state
    setHeartState('loading');

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Please log in first');
        setHeartState('empty');
        return;
      }

      // Find partner link
      const { data: partnerLink } = await supabase
        .from('partner_links')
        .select('partner_id')
        .eq('user_id', user.id)
        .single();

      if (!partnerLink) {
        Alert.alert('Error', 'No partner linked');
        setHeartState('empty');
        return;
      }

      // Send touch to partner via Supabase Realtime
      const { error } = await supabase
        .from('touches')
        .insert({
          sender_id: user.id,
          receiver_id: partnerLink.partner_id,
        });

      if (error) throw error;

      // Set heart to full after sending
      setHeartState('full');

      // Reset after 2 seconds
      setTimeout(() => {
        setHeartState('empty');
      }, 2000);

    } catch (error: any) {
      Alert.alert('Error', error.message);
      setHeartState('empty');
    }
  };

  // Listen for incoming touches (Realtime subscription)
  React.useEffect(() => {
    const { data: { user } } = supabase.auth.getUser();
    
    if (!user) return;

    const channel = supabase
      .channel('touches')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'touches',
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          // Trigger vibration on receiving a touch
          Vibration.vibrate([0, 100, 50, 100]);
          setHeartState('full');
          setTimeout(() => setHeartState('empty'), 2000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: theme.text },
        ]}
      >
        Send Love
      </Text>

      <Text
        style={[
          styles.subtitle,
          { color: theme.textMuted },
        ]}
      >
        Tap the heart to send a touch to your partner
      </Text>

      <PixelHeart
        state={heartState}
        onPress={sendTouch}
        size={180}
      />

      <Text
        style={[
          styles.instruction,
          { color: theme.textMuted },
        ]}
      >
        {heartState === 'empty' && 'Tap to send'}
        {heartState === 'loading' && 'Sending...'}
        {heartState === 'full' && 'Sent with love!'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 48,
    paddingHorizontal: 24,
  },
  instruction: {
    fontSize: 16,
    fontFamily: 'monospace',
    marginTop: 32,
  },
});
