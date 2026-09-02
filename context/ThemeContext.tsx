import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

export type ColorSchemeName = 'light' | 'dark';

interface ThemeContextType {
  colorScheme: ColorSchemeName;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (scheme: ColorSchemeName) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colorScheme: 'dark',
  isDark: true,
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useRNColorScheme();
  // Default to 'dark' or system, with explicit state control
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>('dark');

  const toggleTheme = () => {
    setColorScheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (scheme: ColorSchemeName) => {
    setColorScheme(scheme);
  };

  const isDark = colorScheme === 'dark';

  return (
    <ThemeContext.Provider value={{ colorScheme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
