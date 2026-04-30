import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '../hooks/useSession';

const SESSIONS_KEY = 'sessions';

export async function loadSessions(): Promise<Session[]> {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    return raw ? (JSON.parse(raw) as Session[]) : [];
  } catch {
    return [];
  }
}

export async function saveSessions(sessions: Session[]) {
  try {
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    // ignore
  }
}

export async function appendSession(session: Session) {
  const sessions = await loadSessions();
  const next = [session, ...sessions];
  await saveSessions(next);
}

export type Period = 'today' | 'week' | 'month' | 'all';

export function filterSessions(sessions: Session[], period: Period): Session[] {
  const now = new Date();
  return sessions.filter(session => {
    const date = new Date(session.startedAt);
    switch (period) {
      case 'today':
        return date.toDateString() === now.toDateString();
      case 'week': {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date >= weekAgo;
      }
      case 'month':
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      case 'all':
        return true;
    }
  });
}

export function calcByDayOfWeekMinutes(sessions: Session[]): number[] {
  // [月, 火, 水, 木, 金, 土, 日]
  const result = [0, 0, 0, 0, 0, 0, 0];
  sessions.forEach(session => {
    const day = (new Date(session.startedAt).getDay() + 6) % 7;
    result[day] += Math.round(session.focusDuration / 60);
  });
  return result;
}

export function calcByTimeOfDaySeconds(sessions: Session[]) {
  const sum = (items: Session[]) =>
    items.reduce((acc, session) => acc + session.focusDuration, 0);

  const morning = sum(
    sessions.filter(session => {
      const h = new Date(session.startedAt).getHours();
      return h >= 6 && h < 9;
    }),
  );

  const afternoon = sum(
    sessions.filter(session => {
      const h = new Date(session.startedAt).getHours();
      return h >= 12 && h < 15;
    }),
  );

  const night = sum(
    sessions.filter(session => {
      const h = new Date(session.startedAt).getHours();
      return h >= 20 && h < 23;
    }),
  );

  return { morning, afternoon, night };
}

export function calcFocusScore(session: Session): number {
  const score = 100 - session.interrupted * 10;
  return Math.max(0, score);
}

export function calcAvgFocusScore(sessions: Session[]): number {
  if (sessions.length === 0) {
    return 0;
  }
  const total = sessions.reduce((acc, session) => acc + calcFocusScore(session), 0);
  return Math.round(total / sessions.length);
}

export function calcStreak(sessions: Session[]): number {
  const uniqueDates = new Set(
    sessions.map(session => new Date(session.startedAt).toDateString()),
  );
  const dates = [...uniqueDates]
    .map(dateStr => new Date(dateStr))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  let current = new Date();

  for (const date of dates) {
    const diffDays = Math.round(
      (current.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays <= 1) {
      streak += 1;
      current = date;
    } else {
      break;
    }
  }

  return streak;
}

export function formatHours(totalSeconds: number) {
  const hours = totalSeconds / 3600;
  return `${hours.toFixed(1)}h`;
}
