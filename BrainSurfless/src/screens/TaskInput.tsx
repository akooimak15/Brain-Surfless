import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Props = {
  onStart: (taskName: string, targetSeconds: number) => void;
};

const DEFAULT_MINUTES = '25';

export default function TaskInput({ onStart }: Props) {
  const [taskName, setTaskName] = useState('');
  const [minutesText, setMinutesText] = useState(DEFAULT_MINUTES);

  const minutesValue = useMemo(() => Number(minutesText), [minutesText]);
  const isValid =
    taskName.trim().length > 0 &&
    Number.isFinite(minutesValue) &&
    minutesValue > 0;

  const handleStart = () => {
    if (!isValid) {
      return;
    }
    const targetSeconds = Math.round(minutesValue * 60);
    onStart(taskName.trim(), targetSeconds);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <Text style={styles.brand}>Brain Surfless</Text>
          <Text style={styles.title}>伏せると、集中が進む。</Text>
          <Text style={styles.subtitle}>
            スマホを伏せた時間だけ、タイマーが進みます。
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>今日のタスク</Text>
          <TextInput
            style={styles.input}
            value={taskName}
            onChangeText={setTaskName}
            placeholder="例: 企画書の下書き"
            placeholderTextColor="#A0A0A0"
            autoCorrect={false}
          />
          <Text style={styles.label}>集中時間（分）</Text>
          <TextInput
            style={styles.input}
            value={minutesText}
            onChangeText={setMinutesText}
            placeholder="25"
            placeholderTextColor="#A0A0A0"
            keyboardType="numeric"
          />
          <Text style={styles.helper}>端末を伏せるとカウントが進みます。</Text>
        </View>

        <Pressable
          onPress={handleStart}
          disabled={!isValid}
          style={({ pressed }) => [
            styles.primaryButton,
            !isValid && styles.primaryButtonDisabled,
            pressed && isValid && styles.primaryButtonPressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>集中をはじめる</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  hero: {
    marginBottom: 28,
  },
  brand: {
    fontSize: 14,
    letterSpacing: 2.4,
    color: '#111111',
    fontFamily: 'MPLUSRounded1c-Thin',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111111',
    marginTop: 12,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  subtitle: {
    fontSize: 14,
    color: '#4A4A4A',
    marginTop: 10,
    lineHeight: 20,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111111',
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#111111',
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  helper: {
    fontSize: 12,
    color: '#6A6A6A',
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: '#111111',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  primaryButtonDisabled: {
    backgroundColor: '#C8C8C8',
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.6,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
});
