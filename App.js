import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native'; // <-- ¡Aquí agregamos Text!
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFonts } from 'expo-font';

import { ThemeProvider } from './src/theme/ThemeContext';

import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';
import PetScreen from './src/screens/PetScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// Pixel‑art inspired tab icons (text/emoji)
const TAB_ICONS = {
  Home: '🏠',
  Calendar: '📅',
  AddTask: '➕',
  Pet: '🐾',
  Profile: '👤',
};

// New theme matching Figma: soft light pink background + dark magenta primary
const pixelTheme = {
  background: '#FFF0F5',  // soft light pink
  primary: '#C71585',     // sharp dark magenta
  light: '#FFB6C1',       // light pink
  medium: '#DB7093',      // pale violet red
  dark: '#8B0A50',        // deep magenta
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => (
          <Text style={{ fontSize: size, color }}>{TAB_ICONS[route.name]}</Text>
        ),
        tabBarActiveTintColor: pixelTheme.primary,
        tabBarInactiveTintColor: pixelTheme.light,
        tabBarStyle: {
          backgroundColor: pixelTheme.medium,
          borderTopColor: pixelTheme.primary,
          borderTopWidth: 2,
        },
        headerStyle: {
          backgroundColor: pixelTheme.primary,
        },
        headerTintColor: pixelTheme.background,
        headerTitleStyle: {
          fontFamily: 'PressStart2P-Regular',
          fontSize: 14,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="AddTask" component={AddTaskScreen} options={{ title: 'Add Task' }} />
      <Tab.Screen name="Pet" component={PetScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'PressStart2P-Regular': require('./assets/fonts/PressStart2P-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={pixelTheme.primary} />
      </View>
    );
  }

  return (
    <ThemeProvider initialTheme={pixelTheme}>
      <NavigationContainer>
        <MainTabs />
      </NavigationContainer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF0F5',
  },
});