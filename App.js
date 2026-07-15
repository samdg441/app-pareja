import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFonts } from 'expo-font';
import { Image } from 'react-native';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';
import PetScreen from './src/screens/PetScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';   // original login (now replaced by AuthScreen)
import AuthScreen from './src/screens/AuthScreen';     // new authentication screen

// Custom tab icons (your pixel art images)
const TAB_ICONS = {
  Home: require('./assets/home.png'),
  Calendar: require('./assets/calendar.png'),
  AddTask: require('./assets/add.png'),
  Pet: require('./assets/pet.png'),
  Profile: require('./assets/profile.png'),
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Bottom Tabs ───────────────────────────────────────────────────
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
                width: 28,
                height: 28,
                opacity: focused ? 1 : 0.4,
                resizeMode: 'contain',
                marginTop: 6,
              }}
            />
          );
        },
        tabBarShowLabel: false,
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

// ─── Root Stack (Auth → Main) ──────────────────────────────────────
function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
    </Stack.Navigator>
  );
}

// ─── App Entry Point ───────────────────────────────────────────────
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