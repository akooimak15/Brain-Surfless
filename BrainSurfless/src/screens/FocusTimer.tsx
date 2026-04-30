import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  AppState,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSensor } from '../hooks/useSensor';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  taskName: string;
  targetSeconds: number;
  onComplete: (focusSeconds: number, interrupted: number) => void;
  onStop: (focusSeconds: number, interrupted: number) => void;
};

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const padded = String(seconds).padStart(2, '0');
  return `${minutes}:${padded}`;
}

export default function FocusTimer({
  taskName,
  targetSeconds,
  onComplete,
  onStop,
}: Props) {
  const { isFaceDown } = useSensor();
  const { theme } = useTheme();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [interrupted, setInterrupted] = useState(0);
  const [completed, setCompleted] = useState(false);
  const sinkAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const prevFaceDown = useRef(isFaceDown);
  const prevFaceDownForAnim = useRef(isFaceDown);
  const runningSinceRef = useRef<number | null>(null);
  const elapsedMsRef = useRef(0);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    if (completed) {
      return;
    }

    if (isFaceDown && runningSinceRef.current === null) {
      runningSinceRef.current = Date.now();
    }

    if (!isFaceDown && runningSinceRef.current !== null) {
      elapsedMsRef.current += Date.now() - runningSinceRef.current;
      runningSinceRef.current = null;
    }
  }, [completed, isFaceDown]);

  useEffect(() => {
    if (completed) {
      return;
    }

    const timer = setInterval(() => {
      const base = elapsedMsRef.current;
      const running = runningSinceRef.current
        ? Date.now() - runningSinceRef.current
        : 0;
      const nextSeconds = Math.floor((base + running) / 1000);
      setElapsedSeconds(Math.min(nextSeconds, targetSeconds));
    }, 500);

    return () => clearInterval(timer);
  }, [completed, targetSeconds]);

  useEffect(() => {
    if (
      prevFaceDown.current &&
      !isFaceDown &&
      elapsedSeconds > 0 &&
      elapsedSeconds < targetSeconds
    ) {
      setInterrupted(count => count + 1);
    }
    prevFaceDown.current = isFaceDown;
  }, [elapsedSeconds, isFaceDown, targetSeconds]);

  useEffect(() => {
    if (completed || elapsedSeconds < targetSeconds) {
      return;
    }
    setCompleted(true);
    onComplete(elapsedSeconds, interrupted);
  }, [completed, elapsedSeconds, interrupted, onComplete, targetSeconds]);

  useEffect(() => {
    if (isFaceDown && !prevFaceDownForAnim.current) {
      sinkAnim.setValue(0);
      rippleAnim.setValue(0);
      Animated.parallel([
        Animated.timing(sinkAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevFaceDownForAnim.current = isFaceDown;
  }, [isFaceDown, rippleAnim, sinkAnim]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      const prevState = appStateRef.current;
      appStateRef.current = nextState;

      if (prevState !== 'active' && nextState === 'active') {
        if (runningSinceRef.current !== null) {
          elapsedMsRef.current += Date.now() - runningSinceRef.current;
          runningSinceRef.current = Date.now();
        }
        const base = elapsedMsRef.current;
        const running = runningSinceRef.current
          ? Date.now() - runningSinceRef.current
          : 0;
        const nextSeconds = Math.floor((base + running) / 1000);
        setElapsedSeconds(Math.min(nextSeconds, targetSeconds));
      }
    });

    return () => subscription.remove();
  }, [targetSeconds]);

  const remaining = useMemo(
    () => Math.max(targetSeconds - elapsedSeconds, 0),
    [elapsedSeconds, targetSeconds],
  );
  const progress = useMemo(
    () =>
      targetSeconds === 0
        ? 0
        : Math.min(elapsedSeconds / targetSeconds, 1),
    [elapsedSeconds, targetSeconds],
  );
  const progressWidth = useMemo(
    () => `${Math.round(progress * 100)}%`,
    [progress],
  );
  const timerScale = sinkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.92],
  });
  const timerTranslate = sinkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8],
  });
  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1.35],
  });
  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.18, 0],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.eyebrow, { color: theme.colors.muted }]}>集中セッション</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>{taskName}</Text>
        <View style={styles.timerWrap}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.ripple,
              {
                transform: [{ scale: rippleScale }],
                opacity: rippleOpacity,
                backgroundColor: theme.colors.primary,
              },
            ]}
          />
          <Animated.Text
            style={[
              styles.timer,
              {
                transform: [
                  { scale: timerScale },
                  { translateY: timerTranslate },
                ],
                color: theme.colors.text,
              },
            ]}
          >
            {formatSeconds(remaining)}
          </Animated.Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: theme.colors.track }]}> 
          <View
            style={[
              styles.progressFill,
              { width: progressWidth, backgroundColor: theme.colors.primary },
            ]}
          />
        </View>
        <Text style={[styles.status, { color: theme.colors.muted }]}> 
          {isFaceDown ? '伏せています：カウント中' : '表向き：一時停止'}
        </Text>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.stopButton,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
          pressed && styles.stopButtonPressed,
        ]}
        onPress={() => onStop(elapsedSeconds, interrupted)}
      >
        <Text style={[styles.stopButtonText, { color: theme.colors.text }]}>中断する</Text>
      </Pressable>
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
    marginBottom: 10,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  timer: {
    fontSize: 54,
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: 'MPLUSRounded1c-Thin',
    textAlign: 'center',
  },
  timerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    minHeight: 72,
  },
  ripple: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
  },
  status: {
    fontSize: 14,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  stopButton: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  stopButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  stopButtonText: {
    fontWeight: '700',
    fontFamily: 'MPLUSRounded1c-Thin',
  },
});
