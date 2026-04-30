import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ThemeSettings from '../components/ThemeSettings';
import { useTheme } from '../theme/ThemeContext';

export default function Settings() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.header, { color: theme.colors.text }]}>設定</Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <ThemeSettings />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 28,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
});
