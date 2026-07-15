import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { supabase } from '../lib/supabase';
import { linkPartner, skipPairing as skipPairingUtil } from '../lib/pairing';

// Generar código de 6 caracteres
const generatePairingCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const AuthScreen = ({ navigation }) => {
  // Extraemos todo lo necesario del contexto de tema
  const { theme, themes, activeThemeKey, setActiveThemeKey } = useTheme();

  // Estados de pantalla
  const [screenState, setScreenState] = useState('auth'); // 'auth' | 'profileSetup' | 'pairing'
  const [isSignUp, setIsSignUp] = useState(false);

  // Auth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Perfil
  const [username, setUsername] = useState('');
  // Ahora guardamos la key del tema en lugar del hex
  const [selectedThemeKey, setSelectedThemeKey] = useState(activeThemeKey);
  const [avatarUrl, setAvatarUrl] = useState('');

  // Vinculación
  const [myPairingCode, setMyPairingCode] = useState('');
  const [partnerCode, setPartnerCode] = useState('');

  // UI
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Suscripción a cambios de sesión
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
          checkProfileAndNavigate(session.user);
        } else {
          setUser(null);
          setScreenState('auth');
        }
      }
    );

    // Sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        checkProfileAndNavigate(session.user);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Determinar siguiente pantalla y cargar tema guardado
  const checkProfileAndNavigate = async (currentUser) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (error || !profile) {
      setScreenState('profileSetup');
      return;
    }

    // Aplicar el tema guardado si existe
    if (profile.base_color && themes[profile.base_color]) {
      setActiveThemeKey(profile.base_color);
    }

    setMyPairingCode(profile.pairing_code || '');

    if (profile.partner_id && profile.couple_id) {
      navigation.replace('Main');
    } else if (profile.couple_id) {
      navigation.replace('Main');
    } else {
      setScreenState('pairing');
    }
  };

  // ─── Login / Registro ─────────────────────────────────────────
  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        Alert.alert('Sign Up Failed', error.message);
      } else {
        Alert.alert('Check your email', 'Please verify your email address to continue.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        Alert.alert('Login Failed', error.message);
      }
    }
    setLoading(false);
  };

  // ─── Guardar perfil ────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!username.trim()) {
      Alert.alert('Missing username', 'Please enter a username.');
      return;
    }
    setLoading(true);
    try {
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      if (userError || !currentUser) {
        Alert.alert('Error', 'No se pudo obtener la sesión.');
        setLoading(false);
        return;
      }

      let finalCode = generatePairingCode();
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('pairing_code', finalCode)
        .maybeSingle();
      if (existing) finalCode = generatePairingCode();

      // Guardamos la clave del tema (por ejemplo 'Jade Green') en base_color
      const { error: upsertError } = await supabase.from('profiles').upsert({
        id: currentUser.id,
        username: username.trim(),
        pairing_code: finalCode,
        base_color: selectedThemeKey,    // <-- ahora la key, no el hex
        avatar_url: avatarUrl || null,
      });

      if (upsertError) {
        Alert.alert('Error', upsertError.message);
        setLoading(false);
        return;
      }

      setMyPairingCode(finalCode);
      setScreenState('pairing');
      Alert.alert('¡Perfil guardado!', 'Ahora comparte tu código con tu pareja o continúa en solitario.');
    } catch (err) {
      console.error('Error inesperado:', err);
      Alert.alert('Error', 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Vincular pareja ─────────────────────────────────────────
  const handlePairPartner = async () => {
    if (!partnerCode.trim()) {
      Alert.alert('Missing code', 'Please enter your partner\'s code.');
      return;
    }
    setLoading(true);
    const result = await linkPartner(user.id, partnerCode.trim());
    if (result.success) {
      Alert.alert('¡Vinculado!', 'Ahora estás conectado con tu pareja.', [
        { text: 'OK', onPress: () => navigation.replace('Main') },
      ]);
    } else {
      Alert.alert('Error', result.error);
    }
    setLoading(false);
  };

  // ─── Omitir vinculación ──────────────────────────────────────
  const handleSkip = async () => {
    setLoading(true);
    const result = await skipPairingUtil(user.id);
    if (result.success) {
      Alert.alert('¡Todo listo!', 'Puedes vincular a tu pareja más tarde desde Ajustes.', [
        { text: 'OK', onPress: () => navigation.replace('Main') },
      ]);
    } else {
      Alert.alert('Error', result.error);
    }
    setLoading(false);
  };

  // ─── Selector de tema mejorado (aplica el cambio global inmediato) ──
  const handleThemeSelect = (themeKey) => {
    setSelectedThemeKey(themeKey);
    setActiveThemeKey(themeKey);   // aplica el tema al instante en toda la app
  };

  // ─── Renderizado de secciones ─────────────────────────────────
  const renderAuth = () => (
    <View style={[styles.box, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}>
      <TextInput
        style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
        placeholder="NOMBRE USUARIO"
        placeholderTextColor={theme.textSecondary}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
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
      <TouchableOpacity
        style={[styles.connectButton, { backgroundColor: theme.primary }]}
        onPress={handleAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.headerTint} />
        ) : (
          <Text style={[styles.connectButtonText, { color: theme.headerTint }]}>
            {isSignUp ? 'CREAR CUENTA' : 'INICIAR SESIÓN'}
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={{ marginTop: 12 }}>
        <Text style={[styles.switchText, { color: theme.textSecondary }]}>
          {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderProfileSetup = () => (
    <View style={[styles.box, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}>
      <Text style={[styles.profileTitle, { color: theme.textPrimary }]}>CREAR PERFIL</Text>
      <TextInput
        style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
        placeholder="NOMBRE DE USUARIO"
        placeholderTextColor={theme.textSecondary}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        fontFamily="PressStart2P-Regular"
      />

      <Text style={[styles.label, { color: theme.textPrimary }]}>COLOR TEMA</Text>
      <View style={styles.themeGrid}>
        {Object.keys(themes).map((themeKey) => {
          const palette = themes[themeKey];
          const isSelected = selectedThemeKey === themeKey;
          return (
            <TouchableOpacity
              key={themeKey}
              style={[
                styles.themeCard,
                {
                  backgroundColor: palette.cardBackground,
                  borderColor: isSelected ? theme.primary : theme.border,
                  borderWidth: isSelected ? 3 : 2,
                },
              ]}
              onPress={() => handleThemeSelect(themeKey)}
              activeOpacity={0.7}
            >
              <View style={[styles.colorPreviewSmall, { backgroundColor: palette.primary }]} />
              <Text style={[styles.themeNameSmall, { color: palette.textPrimary }]} numberOfLines={1}>
                {themeKey}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TextInput
        style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
        placeholder="AVATAR URL (opcional)"
        placeholderTextColor={theme.textSecondary}
        value={avatarUrl}
        onChangeText={setAvatarUrl}
        fontFamily="PressStart2P-Regular"
      />
      <TouchableOpacity
        style={[styles.connectButton, { backgroundColor: theme.primary }]}
        onPress={handleSaveProfile}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.headerTint} />
        ) : (
          <Text style={[styles.connectButtonText, { color: theme.headerTint }]}>GUARDAR PERFIL</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderPairing = () => (
    <View style={[styles.box, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}>
      <Text style={[styles.profileTitle, { color: theme.textPrimary }]}>VINCULAR PAREJA</Text>
      <Text style={[styles.codeDisplay, { color: theme.textPrimary }]}>
        TU CÓDIGO: <Text style={{ color: theme.primary }}>{myPairingCode}</Text>
      </Text>
      <TextInput
        style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
        placeholder="CÓDIGO DE TU PAREJA"
        placeholderTextColor={theme.textSecondary}
        value={partnerCode}
        onChangeText={setPartnerCode}
        autoCapitalize="characters"
        maxLength={6}
        fontFamily="PressStart2P-Regular"
      />
      <TouchableOpacity
        style={[styles.connectButton, { backgroundColor: theme.primary }]}
        onPress={handlePairPartner}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.headerTint} />
        ) : (
          <Text style={[styles.connectButtonText, { color: theme.headerTint }]}>VINCULAR</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
        disabled={loading}
      >
        <Text style={[styles.skipButtonText, { color: theme.textSecondary }]}>
          OMITIR POR AHORA
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require('../../assets/heart_4.png')}
          style={styles.heart}
          resizeMode="contain"
        />

        {screenState === 'auth' && (
          <>
            <Text style={[styles.title, { color: theme.textPrimary }]}>UNIR</Text>
            <Text style={[styles.title, { color: theme.textPrimary }]}>PAREJA</Text>
          </>
        )}
        {screenState === 'profileSetup' && (
          <Text style={[styles.title, { color: theme.textPrimary }]}>BIENVENID@</Text>
        )}
        {screenState === 'pairing' && (
          <Text style={[styles.title, { color: theme.textPrimary }]}>CONECTAR</Text>
        )}

        {screenState === 'auth' && renderAuth()}
        {screenState === 'profileSetup' && renderProfileSetup()}
        {screenState === 'pairing' && renderPairing()}

        {screenState === 'auth' && (
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: theme.primary }]}
            onPress={handleAuth}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={[styles.startButtonText, { color: theme.headerTint }]}>START!</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;

// Estilos
const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  heart: { width: 100, height: 100, marginBottom: 20 },
  title: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 6,
  },
  profileTitle: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
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
  switchText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 9,
    textAlign: 'center',
  },
  label: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 11,
    marginBottom: 8,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  themeCard: {
    width: '48%',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorPreviewSmall: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#000',
  },
  themeNameSmall: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 8,
    flexShrink: 1,
  },
  codeDisplay: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
  },
  skipButton: {
    marginTop: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: 'transparent',
  },
  skipButtonText: {
    fontFamily: 'PressStart2P-Regular',
    fontSize: 10,
  },
});