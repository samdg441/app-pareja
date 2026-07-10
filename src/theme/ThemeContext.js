import React, { createContext, useState, useContext } from 'react';

// Default purple palette (light -> medium -> dark -> background)
const defaultPalette = {
  light: '#D8B4FE',   // soft lavender
  medium: '#A855F7',  // vibrant purple
  dark: '#6B21A8',    // deep plum
  background: '#F3E8FF', // very light lilac
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children, initialTheme = defaultPalette }) => {
  const [theme, setTheme] = useState(initialTheme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for easier consumption
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};