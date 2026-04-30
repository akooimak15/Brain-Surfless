import React, { useMemo, useRef } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type Props = {
  value: number;
  min: number;
  max: number;
  step?: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  progressColor?: string;
  labelColor?: string;
  valueColor?: string;
  unitColor?: string;
  label?: string;
  unit?: string;
  onChange: (nextValue: number) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function snap(value: number, step: number) {
  return Math.round(value / step) * step;
}

export default function DonutSeekBar({
  value,
  min,
  max,
  step = 5,
  size = 220,
  strokeWidth = 16,
  trackColor = '#E5E5E5',
  progressColor = '#111111',
  labelColor = '#6A6A6A',
  valueColor = '#111111',
  unitColor = '#6A6A6A',
  label,
  unit = '分',
  onChange,
}: Props) {
  const normalized = useMemo(() => {
    const safe = clamp(value, min, max);
    return max === min ? 0 : (safe - min) / (max - min);
  }, [max, min, value]);

  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - normalized);
  const angle = normalized * 2 * Math.PI - Math.PI / 2;
  const thumbX = center + radius * Math.cos(angle);
  const thumbY = center + radius * Math.sin(angle);

  const updateFromTouch = (x: number, y: number) => {
    const dx = x - center;
    const dy = y - center;
    const rawAngle = Math.atan2(dy, dx);
    const shifted = (rawAngle + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI);
    const ratio = shifted / (2 * Math.PI);
    const nextValue = min + ratio * (max - min);
    const snapped = snap(nextValue, step);
    onChange(clamp(snapped, min, max));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: evt => {
        updateFromTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
      },
      onPanResponderMove: evt => {
        updateFromTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
      },
    }),
  ).current;

  return (
    <View style={[styles.container, { width: size, height: size }]} {...panResponder.panHandlers}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          fill="none"
          rotation={-90}
          origin={`${center}, ${center}`}
        />
        <Circle
          cx={thumbX}
          cy={thumbY}
          r={strokeWidth / 2 + 3}
          fill={progressColor}
        />
      </Svg>
      <View pointerEvents="none" style={styles.centerContent}>
        {label ? <Text style={[styles.label, { color: labelColor }]}>{label}</Text> : null}
        <Text style={[styles.value, { color: valueColor }]}>{Math.round(value)}</Text>
        <Text style={[styles.unit, { color: unitColor }]}>{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    letterSpacing: 1.6,
    marginBottom: 6,
    fontFamily: 'MPLUSRounded1c-Thin',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 42,
    fontWeight: '700',
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  unit: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
});
