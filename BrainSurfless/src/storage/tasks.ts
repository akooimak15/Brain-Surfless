import AsyncStorage from '@react-native-async-storage/async-storage';

export type ScheduledTaskStatus = 'pending' | 'done' | 'skipped';

export type ScheduledTask = {
  id: string;
  taskName: string;
  duration: number; // minutes
  scheduledAt: string; // ISO8601
  googleEventId?: string;
  status: ScheduledTaskStatus;
  createdAt: string;
};

const TASKS_KEY = 'scheduled_tasks';

export async function loadTasks(): Promise<ScheduledTask[]> {
  try {
    const raw = await AsyncStorage.getItem(TASKS_KEY);
    return raw ? (JSON.parse(raw) as ScheduledTask[]) : [];
  } catch {
    return [];
  }
}

export async function saveTasks(tasks: ScheduledTask[]) {
  try {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {
    // ignore
  }
}

export async function upsertTask(task: ScheduledTask) {
  const tasks = await loadTasks();
  const next = [task, ...tasks.filter(item => item.id !== task.id)];
  await saveTasks(next);
}

export function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
