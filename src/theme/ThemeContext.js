import React, { createContext, useState, useContext } from 'react';

const PALETTES = {
  'Pink Love': {
    background: '#FFF0F5',
    primary: '#C71585',
    textPrimary: '#C71585',
    textSecondary: '#D48CB3',
    cardBackground: '#FFE4EC',
    border: '#C71585',
    headerTint: '#FFFFFF',
  },
  'Ocean Blue': {
    background: '#F0F8FF',
    primary: '#1E3A8A',
    textPrimary: '#1E3A8A',
    textSecondary: '#6076B3',
    cardBackground: '#DBEAFE',
    border: '#1E3A8A',
    headerTint: '#FFFFFF',
  },
  'Royal Purple': {
    background: '#F5F3FF',
    primary: '#6B21A8',
    textPrimary: '#6B21A8',
    textSecondary: '#9370DB',
    cardBackground: '#EDE9FE',
    border: '#6B21A8',
    headerTint: '#FFFFFF',
  },
  'Mint Green': {
    background: '#F0FFF4',
    primary: '#047857',
    textPrimary: '#047857',
    textSecondary: '#4CAF84',
    cardBackground: '#D1FAE5',
    border: '#047857',
    headerTint: '#FFFFFF',
  },
  'Sunset Orange': {
    background: '#FFF7ED',
    primary: '#C2410C',
    textPrimary: '#C2410C',
    textSecondary: '#D97A54',
    cardBackground: '#FFEDD5',
    border: '#C2410C',
    headerTint: '#FFFFFF',
  },
  'Dark Dream': {
    background: '#121212',
    primary: '#5e5e5e',        // vibrant accent
    textPrimary: '#FFFFFF',
    textSecondary: '#B0B0B0',
    cardBackground: '#1E1E1E',
    border: '#b9b7bb',
    headerTint: '#FFFFFF',
  },
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [activeThemeKey, setActiveThemeKey] = useState('Royal Purple');
  const theme = PALETTES[activeThemeKey];

  return (
    <ThemeContext.Provider
      value={{ theme, activeThemeKey, setActiveThemeKey, themes: PALETTES }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};