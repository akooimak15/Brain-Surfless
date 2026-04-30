import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { createId, loadTasks, ScheduledTask, upsertTask } from '../storage/tasks';

type DatePreset = 'today' | 'tomorrow';
const DURATIONS = [25, 45, 60] as const;

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

function formatTime(date: Date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function isSameDate(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function parseTime(text: string) {
  const trimmed = text.trim();
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(trimmed);
  if (!match) {
    return null;
  }
  return { hours: Number(match[1]), minutes: Number(match[2]) };
}

function AddTaskModal({
  visible,
  onClose,
  onAdded,
}: {
  visible: boolean;
  onClose: () => void;
  onAdded: () => void;
}) {
  const { theme } = useTheme();
  const [taskName, setTaskName] = useState('');
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>(25);
  const [datePreset, setDatePreset] = useState<DatePreset>('today');
  const [timeText, setTimeText] = useState(formatTime(new Date()));
  const [addToCalendar, setAddToCalendar] = useState(true);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setTaskName('');
    setDuration(25);
    setDatePreset('today');
    setTimeText(formatTime(new Date()));
    setAddToCalendar(true);
  }, [visible]);

  const isValid = useMemo(() => {
    return taskName.trim().length > 0 && parseTime(timeText) !== null;
  }, [taskName, timeText]);

  const handleAdd = async () => {
    if (!isValid) {
      return;
    }

    const parsed = parseTime(timeText);
    if (!parsed) {
      return;
    }

    const base = new Date();
    if (datePreset === 'tomorrow') {
      base.setDate(base.getDate() + 1);
    }

    const scheduled = new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate(),
      parsed.hours,
      parsed.minutes,
      0,
      0,
    );

    const task: ScheduledTask = {
      id: createId('task'),
      taskName: taskName.trim(),
      duration,
      scheduledAt: scheduled.toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      // googleEventId はログイン/カレンダー連携実装後に保存
      googleEventId: addToCalendar ? undefined : undefined,
    };

    await upsertTask(task);
    onAdded();
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>タスクを追加</Text>

          <Text style={[styles.label, { color: theme.colors.text }]}>タスク名</Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
              },
            ]}
            value={taskName}
            onChangeText={setTaskName}
            placeholder="数学の宿題"
            placeholderTextColor={theme.colors.muted}
          />

          <Text style={[styles.label, { color: theme.colors.text }]}>集中時間</Text>
          <View style={styles.chipRow}>
            {DURATIONS.map(value => {
              const selected = value === duration;
              return (
                <Pressable
                  key={value}
                  onPress={() => setDuration(value)}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor: selected
                        ? theme.colors.primary
                        : theme.colors.surface,
                      borderColor: theme.colors.border,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: selected
                          ? theme.colors.primaryText
                          : theme.colors.text,
                      },
                    ]}
                  >
                    {value}分
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: theme.colors.text }]}>日付</Text>
          <View style={styles.chipRow}>
            <Pressable
              onPress={() => setDatePreset('today')}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor:
                    datePreset === 'today'
                      ? theme.colors.primary
                      : theme.colors.surface,
                  borderColor: theme.colors.border,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color:
                      datePreset === 'today'
                        ? theme.colors.primaryText
                        : theme.colors.text,
                  },
                ]}
              >
                今日
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setDatePreset('tomorrow')}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor:
                    datePreset === 'tomorrow'
                      ? theme.colors.primary
                      : theme.colors.surface,
                  borderColor: theme.colors.border,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color:
                      datePreset === 'tomorrow'
                        ? theme.colors.primaryText
                        : theme.colors.text,
                  },
                ]}
              >
                明日
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.label, { color: theme.colors.text }]}>開始時刻</Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
              },
            ]}
            value={timeText}
            onChangeText={setTimeText}
            placeholder="14:00"
            placeholderTextColor={theme.colors.muted}
            autoCorrect={false}
          />

          <Pressable
            onPress={() => setAddToCalendar(v => !v)}
            style={({ pressed }) => [
              styles.checkboxRow,
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: addToCalendar
                    ? theme.colors.primary
                    : theme.colors.surface,
                },
              ]}
            />
            <Text style={[styles.checkboxText, { color: theme.colors.text }]}>
              Googleカレンダーに追加
            </Text>
          </Pressable>

          <View style={styles.modalButtons}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.secondaryButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Text style={[styles.secondaryText, { color: theme.colors.text }]}>キャンセル</Text>
            </Pressable>
            <Pressable
              onPress={handleAdd}
              disabled={!isValid}
              style={({ pressed }) => [
                styles.primaryButton,
                {
                  backgroundColor: isValid
                    ? theme.colors.primary
                    : theme.colors.border,
                  opacity: pressed && isValid ? 0.9 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.primaryText,
                  { color: theme.colors.primaryText },
                ]}
              >
                追加する
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.modalHint, { color: theme.colors.muted }]}>
            ※カレンダー連携は後で有効化できます
          </Text>
        </View>
      </View>
    </Modal>
  );
}

export default function Tasks() {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const refresh = async () => {
    const next = await loadTasks();
    next.sort(
      (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
    setTasks(next);
  };

  useEffect(() => {
    refresh().catch(() => undefined);
  }, []);

  const now = new Date();
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }, []);

  const grouped = useMemo(() => {
    const todayTasks = tasks.filter(task =>
      isSameDate(new Date(task.scheduledAt), now),
    );
    const tomorrowTasks = tasks.filter(task =>
      isSameDate(new Date(task.scheduledAt), tomorrow),
    );
    return { todayTasks, tomorrowTasks };
  }, [now, tasks, tomorrow]);

  const renderTaskCard = (task: ScheduledTask) => {
    const start = new Date(task.scheduledAt);
    const end = addMinutes(start, task.duration);
    const statusText =
      task.status === 'pending'
        ? '予定通り'
        : task.status === 'done'
          ? '完了'
          : 'スキップ';

    return (
      <View
        key={task.id}
        style={[
          styles.taskCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text style={[styles.taskTitle, { color: theme.colors.text }]}>
          📚 {task.taskName}
        </Text>
        <Text style={[styles.taskMeta, { color: theme.colors.muted }]}>
          {`${formatTime(start)} - ${formatTime(end)}（${task.duration}分）`}
        </Text>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  task.status === 'pending'
                    ? theme.colors.primary
                    : theme.colors.border,
              },
            ]}
          />
          <Text style={[styles.statusText, { color: theme.colors.muted }]}>
            {statusText}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.header, { color: theme.colors.text }]}>タスク</Text>

        <Pressable
          onPress={() => setModalVisible(true)}
          style={({ pressed }) => [
            styles.addButton,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <Text style={[styles.addButtonText, { color: theme.colors.text }]}>+ 新しいタスクを追加</Text>
        </Pressable>

        {grouped.todayTasks.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>今日</Text>
            {grouped.todayTasks.map(renderTaskCard)}
          </View>
        ) : null}

        {grouped.tomorrowTasks.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>明日</Text>
            {grouped.tomorrowTasks.map(renderTaskCard)}
          </View>
        ) : null}

        {grouped.todayTasks.length === 0 && grouped.tomorrowTasks.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.muted }]}>まだ予約タスクがありません。</Text>
        ) : null}
      </ScrollView>

      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdded={() => {
          setModalVisible(false);
          refresh().catch(() => undefined);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 28,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  addButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  taskCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  taskMeta: {
    fontSize: 13,
    marginBottom: 10,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  emptyText: {
    fontSize: 14,
    marginTop: 10,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 10,
  },
  checkboxText: {
    fontSize: 13,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 10,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  secondaryText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  modalHint: {
    fontSize: 12,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
});
