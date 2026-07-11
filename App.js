import React from 'react';
import { View, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFonts } from 'expo-font';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';
import PetScreen from './src/screens/PetScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';

// ── Iconos personalizados ─────────────────────────────────────────
const TAB_ICONS = {
  Home: require('./assets/home.png'),
  Calendar: require('./assets/calendar.png'),
  AddTask: require('./assets/add.png'),
  Pet: require('./assets/pet.png'),
  Profile: require('./assets/profile.png'),
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          const icon = TAB_ICONS[route.name];
          return (
            <Image
              source={icon}
              style={{
                width: 65,
                height: 70,
                opacity: focused ? 1 : 0.4,
                resizeMode: 'contain',
                marginTop: 30,
              }}
            />
          );
        },
        tabBarShowLabel: false, // 👈 Oculta los títulos, solo se ven los íconos
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.cardBackground,
          borderTopColor: theme.border,
          borderTopWidth: 2,
        },
        headerStyle: {
          backgroundColor: theme.primary,
        },
        headerTintColor: theme.headerTint,
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

// ─── Stack raíz ────────────────────────────────────────────────────
function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
    </Stack.Navigator>
  );
}

// ─── Punto de entrada de la app ───────────────────────────────────
export default function App() {
  const [fontsLoaded] = useFonts({
    'PressStart2P-Regular': require('./assets/fonts/PressStart2P-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C71585" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        <RootNavigator />
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