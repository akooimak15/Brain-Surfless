import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Session } from '../hooks/useSession';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  session: Session | null;
  onReset: () => void;
};

export default function Complete({ session, onReset }: Props) {
  const { theme } = useTheme();
  if (!session) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
          <Text style={[styles.title, { color: theme.colors.text }]}>セッション完了</Text>
          <Text style={[styles.body, { color: theme.colors.muted }]}>記録が見つかりませんでした。</Text>
          <Pressable style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]} onPress={onReset}>
            <Text style={[styles.primaryButtonText, { color: theme.colors.primaryText }]}>戻る</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
        <Text style={[styles.eyebrow, { color: theme.colors.muted }]}>おつかれさま</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>集中できました</Text>
        <Text style={[styles.body, { color: theme.colors.muted }]}>タスク: {session.taskName}</Text>
        <Text style={[styles.body, { color: theme.colors.muted }]}>
          集中時間: {Math.round(session.focusDuration / 60)} 分
        </Text>
        <Text style={[styles.body, { color: theme.colors.muted }]}>
          中断: {session.interrupted} 回
        </Text>
        <Pressable style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]} onPress={onReset}>
          <Text style={[styles.primaryButtonText, { color: theme.colors.primaryText }]}>次の集中へ</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 28,
    paddingHorizontal: 22,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  body: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  primaryButton: {
    marginTop: 20,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  primaryButtonText: {
    fontWeight: '700',
    fontFamily: 'MPLUSRounded1c-Thin',
  },
});
