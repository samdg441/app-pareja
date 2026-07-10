import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';
import PetScreen from './src/screens/PetScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// Simple pixel‑style emojis for tab icons
const TAB_ICONS = {
  Home: '🏠',
  Calendar: '📅',
  AddTask: '➕',
  Pet: '🐾',
  Profile: '👤',
};

function MainTabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => (
          <Text style={{ fontSize: size, color }}>{TAB_ICONS[route.name]}</Text>
        ),
        tabBarActiveTintColor: theme.dark,
        tabBarInactiveTintColor: theme.light,
        tabBarStyle: {
          backgroundColor: theme.medium,
          borderTopColor: theme.dark,
          borderTopWidth: 2,
        },
        headerStyle: {
          backgroundColor: theme.medium,
        },
        headerTintColor: theme.background,
        headerTitleStyle: {
          fontFamily: 'monospace',
          fontWeight: 'bold',
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
  return (
    <ThemeProvider>
      <NavigationContainer>
        <MainTabs />
      </NavigationContainer>
    </ThemeProvider>
  );
}