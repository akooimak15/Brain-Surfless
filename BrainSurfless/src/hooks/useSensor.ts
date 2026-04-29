import { useEffect, useState } from 'react';
import {
  accelerometer,
  SensorTypes,
  setUpdateIntervalForType,
} from 'react-native-sensors';

export function useSensor() {
  const [isFaceDown, setIsFaceDown] = useState(false);

  useEffect(() => {
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
  }, []);

  return { isFaceDown };
}
