import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '../hooks/useSession';
import { recordSession } from '../api/sessions';
import { REMOTE_SYNC_ENABLED } from '../config/remoteSync';

const PENDING_SESSIONS_KEY = 'pending_sessions';

async function loadPendingSessions(): Promise<Session[]> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_SESSIONS_KEY);
    return raw ? (JSON.parse(raw) as Session[]) : [];
  } catch {
    return [];
  }
}

async function savePendingSessions(sessions: Session[]) {
  try {
    await AsyncStorage.setItem(PENDING_SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    // ignore
  }
}

export async function enqueuePendingSession(session: Session) {
  if (!REMOTE_SYNC_ENABLED) {
    return;
  }
  const pending = await loadPendingSessions();
  if (pending.some(p => p.id === session.id)) {
    return;
  }
  await savePendingSessions([session, ...pending]);
}

export async function flushPendingSessions() {
  if (!REMOTE_SYNC_ENABLED) {
    return { sent: 0, remaining: 0, skipped: true };
  }
  const pending = await loadPendingSessions();
  if (pending.length === 0) {
    return { sent: 0, remaining: 0 };
  }

  const remaining: Session[] = [];
  let sent = 0;

  for (const session of pending) {
    try {
      await recordSession(session);
      sent += 1;
    } catch {
      remaining.push(session);
    }
  }

  await savePendingSessions(remaining);
  return { sent, remaining: remaining.length };
}

export async function syncSession(session: Session) {
  if (!REMOTE_SYNC_ENABLED) {
    return { ok: true, skipped: true };
  }
  try {
    await recordSession(session);
    return { ok: true };
  } catch {
    await enqueuePendingSession(session);
    return { ok: false };
  }
}
