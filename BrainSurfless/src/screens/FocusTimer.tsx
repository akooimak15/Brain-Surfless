import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSensor } from '../hooks/useSensor';

type Props = {
  taskName: string;
  targetSeconds: number;
  onComplete: (focusSeconds: number, interrupted: boolean) => void;
  onStop: (focusSeconds: number, interrupted: boolean) => void;
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
  const [elapsed, setElapsed] = useState(0);
  const [interrupted, setInterrupted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const sinkAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const prevFaceDown = useRef(isFaceDown);

  useEffect(() => {
    if (completed || !isFaceDown) {
      return;
    }
    const timer = setInterval(() => {
      setElapsed(prev => Math.min(prev + 1, targetSeconds));
    }, 1000);
    return () => clearInterval(timer);
  }, [completed, isFaceDown, targetSeconds]);

  useEffect(() => {
    if (!isFaceDown && elapsed > 0 && elapsed < targetSeconds) {
      setInterrupted(true);
    }
  }, [elapsed, isFaceDown, targetSeconds]);

  useEffect(() => {
    if (completed || elapsed < targetSeconds) {
      return;
    }
    setCompleted(true);
    onComplete(elapsed, interrupted);
  }, [completed, elapsed, interrupted, onComplete, targetSeconds]);

  useEffect(() => {
    if (isFaceDown && !prevFaceDown.current) {
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
    prevFaceDown.current = isFaceDown;
  }, [isFaceDown, rippleAnim, sinkAnim]);

  const remaining = useMemo(
    () => Math.max(targetSeconds - elapsed, 0),
    [elapsed, targetSeconds],
  );
  const progress = useMemo(
    () => (targetSeconds === 0 ? 0 : Math.min(elapsed / targetSeconds, 1)),
    [elapsed, targetSeconds],
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
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>集中セッション</Text>
        <Text style={styles.title}>{taskName}</Text>
        <View style={styles.timerWrap}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.ripple,
              {
                transform: [{ scale: rippleScale }],
                opacity: rippleOpacity,
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
              },
            ]}
          >
            {formatSeconds(remaining)}
          </Animated.Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.status}>
          {isFaceDown ? '伏せています：カウント中' : '表向き：一時停止'}
        </Text>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.stopButton,
          pressed && styles.stopButtonPressed,
        ]}
        onPress={() => onStop(elapsed, interrupted)}
      >
        <Text style={styles.stopButtonText}>中断する</Text>
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
    marginBottom: 10,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111111',
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  timer: {
    fontSize: 54,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111111',
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
    backgroundColor: '#111111',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#EDEDED',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#111111',
  },
  status: {
    fontSize: 14,
    color: '#4A4A4A',
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  stopButton: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    borderWidth: 1,
    borderColor: '#D9D9D9',
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
    color: '#111111',
    fontWeight: '700',
    fontFamily: 'MPLUSRounded1c-Thin',
  },
});
