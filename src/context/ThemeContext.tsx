import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ColorPalette, ThemeName, themes } from '../theme/colors';

interface ThemeContextType {
  theme: ColorPalette;
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeName, setThemeName] = useState<ThemeName>('blue');
  const theme = themes[themeName];

  const setTheme = (newThemeName: ThemeName) => {
    setThemeName(newThemeName);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
