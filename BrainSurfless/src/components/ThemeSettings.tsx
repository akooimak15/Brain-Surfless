import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  title?: string;
};

export default function ThemeSettings({ title = '表示テーマ' }: Props) {
  const { theme, setMode, setAccent, accents } = useTheme();

  return (
    <View>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {title}
      </Text>
      <View style={styles.modeRow}>
        <Pressable
          onPress={() => setMode('light')}
          style={({ pressed }) => [
            styles.modeButton,
            {
              borderColor: theme.colors.border,
              backgroundColor:
                theme.mode === 'light' ? theme.colors.primary : theme.colors.surface,
            },
            pressed && styles.modeButtonPressed,
          ]}
        >
          <Text
            style={[
              styles.modeLabel,
              {
                color:
                  theme.mode === 'light'
                    ? theme.colors.primaryText
                    : theme.colors.text,
              },
            ]}
          >
            ライト
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setMode('dark')}
          style={({ pressed }) => [
            styles.modeButton,
            {
              borderColor: theme.colors.border,
              backgroundColor:
                theme.mode === 'dark' ? theme.colors.primary : theme.colors.surface,
            },
            pressed && styles.modeButtonPressed,
          ]}
        >
          <Text
            style={[
              styles.modeLabel,
              {
                color:
                  theme.mode === 'dark'
                    ? theme.colors.primaryText
                    : theme.colors.text,
              },
            ]}
          >
            ダーク
          </Text>
        </Pressable>
      </View>
      <Text style={[styles.subTitle, { color: theme.colors.muted }]}>カラー</Text>
      <View style={styles.swatchRow}>
        {accents.map(accent => {
          const selected = accent.id === theme.accent.id;
          return (
            <Pressable
              key={accent.id}
              onPress={() => setAccent(accent.id)}
              style={({ pressed }) => [
                styles.swatch,
                {
                  backgroundColor: accent.color,
                  borderColor: selected ? theme.colors.text : 'transparent',
                  transform: [{ scale: pressed ? 0.92 : 1 }],
                },
              ]}
            >
              {selected ? <View style={styles.swatchInner} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  modeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 10,
  },
  modeButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  modeLabel: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  subTitle: {
    fontSize: 12,
    marginBottom: 10,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    marginRight: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
});
