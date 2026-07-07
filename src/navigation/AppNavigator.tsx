import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { HomeScreen } from '../screens/HomeScreen';
import { PixelCalendarScreen } from '../screens/PixelCalendarScreen';
import { AddTaskScreen } from '../screens/AddTaskScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export const AppNavigator = () => {
  const { theme } = useTheme();

  return (
    <NavigationContainer independent={true}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Home') {
              iconName = focused ? 'heart' : 'heart-outline';
            } else if (route.name === 'Calendar') {
              iconName = focused ? 'grid' : 'grid-outline';
            } else if (route.name === 'AddTask') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else {
              iconName = 'help-circle-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.primaryDark,
          tabBarInactiveTintColor: theme.textMuted,
          tabBarStyle: {
            backgroundColor: theme.surface,
            borderTopWidth: 4,
            borderTopColor: theme.border,
            paddingBottom: 8,
            paddingTop: 8,
            height: 65,
          },
          tabBarLabelStyle: {
            fontFamily: 'monospace',
            fontSize: 12,
            fontWeight: 'bold',
          },
          headerStyle: {
            backgroundColor: theme.surface,
            borderBottomWidth: 4,
            borderBottomColor: theme.border,
          },
          headerTitleStyle: {
            fontFamily: 'monospace',
            fontWeight: 'bold',
            color: theme.text,
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Touch' }}
        />
        <Tab.Screen
          name="Calendar"
          component={PixelCalendarScreen}
          options={{ title: 'Calendar' }}
        />
        <Tab.Screen
          name="AddTask"
          component={AddTaskScreen}
          options={{ title: 'Add Task' }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'Profile' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
