import { useState } from 'react';

export type Session = {
  id: string;
  userId: string;
  taskName: string;
  startedAt: string;
  endedAt: string;
  focusDuration: number;
  interrupted: number;
  pointsEarned: number;
};

type ActiveSession = {
  taskName: string;
  startedAt: string;
};

const DEFAULT_USER_ID = 'local-user';

const createSessionId = () =>
  `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export function useSession() {
  const [active, setActive] = useState<ActiveSession | null>(null);

  const startSession = (taskName: string) => {
    setActive({ taskName, startedAt: new Date().toISOString() });
  };

  const finishSession = (focusDuration: number, interrupted: number) => {
    if (!active) {
      return null;
    }

    const session: Session = {
      id: createSessionId(),
      userId: DEFAULT_USER_ID,
      taskName: active.taskName,
      startedAt: active.startedAt,
      endedAt: new Date().toISOString(),
      focusDuration,
      interrupted,
      pointsEarned: 0,
    };
    setActive(null);
    return session;
  };

  return { active, startSession, finishSession };
}
