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
  'Midnight Blue': {         // antes Ocean Blue
    background: '#E2EAFC',
    primary: '#3F51B5',
    textPrimary: '#1A237E',
    textSecondary: '#8E9AAF',
    cardBackground: '#D6E4FF',
    border: '#3F51B5',
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
  'Jade Green': {            // antes Mint Green
    background: '#E0F2F1',
    primary: '#26A69A',
    textPrimary: '#004D40',
    textSecondary: '#80CBC4',
    cardBackground: '#B2DFDB',
    border: '#26A69A',
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
    background: '#0D0D0D',        // fondo principal casi negro
    primary: '#A0A0A0',          // gris claro para botones y acentos
    textPrimary: '#E0E0E0',      // texto principal blanco roto (no deslumbrante)
    textSecondary: '#808080',    // texto secundario gris medio
    cardBackground: '#1A1A1A',   // fondo de tarjetas, ligeramente más claro
    border: '#505050',           // bordes gris oscuro
    headerTint: '#E0E0E0',      // color del texto en la barra superior
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