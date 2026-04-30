import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ThemeMode = 'light' | 'dark';

type Accent = {
  id: string;
  label: string;
  color: string;
};

type ThemeColors = {
  background: string;
  surface: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  primaryText: string;
  track: string;
  overlay: string;
};

type Theme = {
  mode: ThemeMode;
  accent: Accent;
  colors: ThemeColors;
};

type ThemeContextValue = {
  theme: Theme;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accentId: string) => void;
  accents: Accent[];
};

const STORAGE_MODE_KEY = 'brainsurfless.theme.mode';
const STORAGE_ACCENT_KEY = 'brainsurfless.theme.accent';

const ACCENTS: Accent[] = [
  { id: 'purple', label: 'Purple', color: '#534AB7' },
  { id: 'sky', label: 'Sky', color: '#2E8BC0' },
  { id: 'mint', label: 'Mint', color: '#2F9E7E' },
  { id: 'amber', label: 'Amber', color: '#D88A2C' },
  { id: 'rose', label: 'Rose', color: '#D95E8A' },
  { id: 'indigo', label: 'Indigo', color: '#3B5BDB' },
];

const ThemeContext = createContext<ThemeContextValue | null>(null);

function clampChannel(value: number) {
  return Math.min(255, Math.max(0, Math.round(value)));
}

function scaleColor(color: string, factor: number) {
  const hex = color.replace('#', '');
  if (hex.length !== 6) {
    return color;
  }
  const r = clampChannel(parseInt(hex.slice(0, 2), 16) * factor);
  const g = clampChannel(parseInt(hex.slice(2, 4), 16) * factor);
  const b = clampChannel(parseInt(hex.slice(4, 6), 16) * factor);
  return `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function buildTheme(mode: ThemeMode, accent: Accent): Theme {
  const accentColor = mode === 'dark' ? scaleColor(accent.color, 0.75) : accent.color;
  return {
    mode,
    accent,
    colors: {
      background: mode === 'dark' ? '#141414' : '#F6F4F1',
      surface: mode === 'dark' ? '#1C1C1C' : '#FFFFFF',
      card: mode === 'dark' ? '#1E1E1E' : 'rgba(255, 255, 255, 0.78)',
      text: mode === 'dark' ? '#F4F4F4' : '#111111',
      muted: mode === 'dark' ? '#9A9A9A' : '#4A4A4A',
      border: mode === 'dark' ? '#2C2C2C' : '#D9D9D9',
      primary: accentColor,
      primaryText: '#FFFFFF',
      track: mode === 'dark' ? '#2B2B2B' : '#EDEDED',
      overlay: 'rgba(0, 0, 0, 0.55)',
    },
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [accentId, setAccentId] = useState<string>(ACCENTS[0].id);

  useEffect(() => {
    const load = async () => {
      try {
        const [storedMode, storedAccent] = await Promise.all([
          AsyncStorage.getItem(STORAGE_MODE_KEY),
          AsyncStorage.getItem(STORAGE_ACCENT_KEY),
        ]);
        if (storedMode === 'light' || storedMode === 'dark') {
          setMode(storedMode);
        }
        if (storedAccent && ACCENTS.some(accent => accent.id === storedAccent)) {
          setAccentId(storedAccent);
        }
      } catch {
        // ignore storage errors
      }
    };

    load();
  }, []);

  useEffect(() => {
    const persist = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_MODE_KEY, mode);
      } catch {
        // ignore storage errors
      }
    };

    persist();
  }, [mode]);

  useEffect(() => {
    const persist = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_ACCENT_KEY, accentId);
      } catch {
        // ignore storage errors
      }
    };

    persist();
  }, [accentId]);

  const accent = useMemo(
    () => ACCENTS.find(item => item.id === accentId) ?? ACCENTS[0],
    [accentId],
  );

  const theme = useMemo(() => buildTheme(mode, accent), [accent, mode]);

  const value = useMemo(
    () => ({
      theme,
      setMode,
      setAccent: setAccentId,
      accents: ACCENTS,
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
