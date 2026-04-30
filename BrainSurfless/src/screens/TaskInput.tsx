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
import DonutSeekBar from '../components/DonutSeekBar';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  onStart: (taskName: string, targetSeconds: number) => void;
};

const DEFAULT_MINUTES = '25';
const MIN_MINUTES = 5;
const MAX_MINUTES = 120;
const STEP_MINUTES = 5;

export default function TaskInput({ onStart }: Props) {
  const { theme } = useTheme();
  const [taskName, setTaskName] = useState('');
  const [minutesText, setMinutesText] = useState(DEFAULT_MINUTES);

  const minutesValue = useMemo(() => Number(minutesText), [minutesText]);
  const safeMinutes = useMemo(
    () => (Number.isFinite(minutesValue) ? minutesValue : MIN_MINUTES),
    [minutesValue],
  );
  const clampedMinutes = useMemo(
    () =>
      Math.min(Math.max(safeMinutes, MIN_MINUTES), MAX_MINUTES),
    [safeMinutes],
  );
  const steppedMinutes = useMemo(
    () => Math.round(clampedMinutes / STEP_MINUTES) * STEP_MINUTES,
    [clampedMinutes],
  );
  const isValid =
    taskName.trim().length > 0 &&
    Number.isFinite(minutesValue) &&
    minutesValue >= MIN_MINUTES &&
    minutesValue <= MAX_MINUTES;

  const handleStart = () => {
    if (!isValid) {
      return;
    }
    const targetSeconds = Math.round(steppedMinutes * 60);
    onStart(taskName.trim(), targetSeconds);
  };

  const handleMinutesBlur = () => {
    setMinutesText(String(steppedMinutes));
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <Text style={[styles.brand, { color: theme.colors.text }]}>Brain Surfless</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>伏せると、集中が進む。</Text>
          <Text style={[styles.subtitle, { color: theme.colors.muted }]}>
            スマホを伏せた時間だけ、タイマーが進みます。
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
          <Text style={[styles.label, { color: theme.colors.text }]}>今日のタスク</Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
              },
            ]}
            value={taskName}
            onChangeText={setTaskName}
            placeholder="例: 企画書の下書き"
            placeholderTextColor={theme.colors.muted}
            autoCorrect={false}
          />
          <Text style={[styles.label, { color: theme.colors.text }]}>集中時間（分）</Text>
          <View style={styles.seekWrap}>
            <DonutSeekBar
              value={steppedMinutes}
              min={MIN_MINUTES}
              max={MAX_MINUTES}
              step={STEP_MINUTES}
              label="Focus"
              trackColor={theme.colors.track}
              progressColor={theme.colors.primary}
              labelColor={theme.colors.muted}
              valueColor={theme.colors.text}
              unitColor={theme.colors.muted}
              onChange={nextValue => setMinutesText(String(nextValue))}
            />
          </View>
          <View style={styles.minutesRow}>
            <TextInput
              style={[
                styles.minutesInput,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                },
              ]}
              value={minutesText}
              onChangeText={setMinutesText}
              onBlur={handleMinutesBlur}
              placeholder="25"
              placeholderTextColor={theme.colors.muted}
              keyboardType="numeric"
            />
            <Text style={[styles.minutesSuffix, { color: theme.colors.muted }]}>分</Text>
          </View>
          <Text style={[styles.helper, { color: theme.colors.muted }]}>
            {`端末を伏せるとカウントが進みます。${MIN_MINUTES}-${MAX_MINUTES}分`}
          </Text>
        </View>

        <Pressable
          onPress={handleStart}
          disabled={!isValid}
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: theme.colors.primary },
            !isValid && { backgroundColor: theme.colors.border },
            pressed && isValid && styles.primaryButtonPressed,
          ]}
        >
          <Text style={[styles.primaryButtonText, { color: theme.colors.primaryText }]}>集中をはじめる</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontFamily: 'MPLUSRounded1c-Thin',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    marginTop: 12,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 10,
    lineHeight: 20,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  card: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
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
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  seekWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  minutesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  minutesInput: {
    minWidth: 80,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: 'MPLUSRounded1c-Thin',
    textAlign: 'center',
  },
  minutesSuffix: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  helper: {
    fontSize: 12,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  primaryButton: {
    marginTop: 20,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.6,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
});
