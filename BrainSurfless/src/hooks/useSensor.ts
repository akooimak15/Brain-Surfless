import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import {
  accelerometer,
  SensorTypes,
  setUpdateIntervalForType,
} from 'react-native-sensors';

export function useSensor() {
  const [isFaceDown, setIsFaceDown] = useState(false);
  const [isActive, setIsActive] = useState(
    AppState.currentState === 'active',
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      setIsActive(nextState === 'active');
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!isActive) {
      return;
    }
    setUpdateIntervalForType(SensorTypes.accelerometer, 500);
    const subscription = accelerometer.subscribe(
      ({ z }) => {
        setIsFaceDown(z < -0.3);
      },
      () => {
        setIsFaceDown(false);
      },
    );

    return () => subscription.unsubscribe();
  }, [isActive]);

  return { isFaceDown };
}
