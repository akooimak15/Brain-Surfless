import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Session } from '../hooks/useSession';

type Props = {
  session: Session | null;
  onReset: () => void;
};

export default function Complete({ session, onReset }: Props) {
  if (!session) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>セッション完了</Text>
          <Text style={styles.body}>記録が見つかりませんでした。</Text>
          <Pressable style={styles.primaryButton} onPress={onReset}>
            <Text style={styles.primaryButtonText}>戻る</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>おつかれさま</Text>
        <Text style={styles.title}>集中できました</Text>
        <Text style={styles.body}>タスク: {session.taskName}</Text>
        <Text style={styles.body}>
          集中時間: {Math.round(session.focusDuration / 60)} 分
        </Text>
        <Text style={styles.body}>
          中断: {session.interrupted ? 'あり' : 'なし'}
        </Text>
        <Pressable style={styles.primaryButton} onPress={onReset}>
          <Text style={styles.primaryButtonText}>次の集中へ</Text>
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
    backgroundColor: '#F2F2F2',
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderRadius: 12,
    paddingVertical: 28,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 2.2,
    color: '#111111',
    textTransform: 'uppercase',
    marginBottom: 8,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111111',
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  body: {
    fontSize: 14,
    color: '#4A4A4A',
    marginBottom: 8,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: '#111111',
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
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'MPLUSRounded1c-Thin',
  },
});
