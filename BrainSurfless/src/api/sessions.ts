import type { Session } from '../hooks/useSession';
import { getApiBaseUrl } from '../config/apiBaseUrl';

const API_BASE_URL = getApiBaseUrl();

export async function recordSession(session: Session) {
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(session),
  });

  if (!response.ok) {
    throw new Error('Failed to record session');
  }
}

export async function getStats(userId: string) {
  const response = await fetch(`${API_BASE_URL}/stats?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to load stats');
  }
  return response.json() as Promise<{
    totalSessions: number;
    totalFocusSeconds: number;
  }>;
}
