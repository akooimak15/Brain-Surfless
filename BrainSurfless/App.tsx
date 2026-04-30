import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import Complete from './src/screens/Complete';
import FocusTimer from './src/screens/FocusTimer';
import NudgeModal from './src/screens/NudgeModal';
import Settings from './src/screens/Settings';
import Stats from './src/screens/Stats';
import TaskInput from './src/screens/TaskInput';
import Tasks from './src/screens/Tasks';
import { recordSession } from './src/api/sessions';
import { Session, useSession } from './src/hooks/useSession';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { appendSession } from './src/storage/sessions';

type Stage = 'task' | 'nudge' | 'timer' | 'complete';
type TabKey = 'timer' | 'stats' | 'tasks' | 'settings';

type PendingTask = {
  taskName: string;
  targetSeconds: number;
};

function AppContent() {
  const [stage, setStage] = useState<Stage>('task');
  const [tab, setTab] = useState<TabKey>('timer');
  const [pendingTask, setPendingTask] = useState<PendingTask | null>(null);
  const [lastSession, setLastSession] = useState<Session | null>(null);
  const { startSession, finishSession } = useSession();
  const { theme } = useTheme();

  const tabItems = useMemo(
    () =>
      [
        { key: 'timer' as const, label: 'タイマー' },
        { key: 'stats' as const, label: '統計' },
        { key: 'tasks' as const, label: 'タスク' },
        { key: 'settings' as const, label: '設定' },
      ],
    [],
  );

  const handleStart = (taskName: string, targetSeconds: number) => {
    setPendingTask({ taskName, targetSeconds });
    setStage('nudge');
  };

  const handleNudgeContinue = () => {
    if (!pendingTask) {
      return;
    }
    startSession(pendingTask.taskName);
    setStage('timer');
  };

  const handleComplete = (focusSeconds: number, interrupted: number) => {
    const session = finishSession(focusSeconds, interrupted);
    if (session) {
      setLastSession(session);
      recordSession(session).catch(() => undefined);
      appendSession(session).catch(() => undefined);
    }
    setStage('complete');
  };

  const handleStop = (focusSeconds: number, interrupted: number) => {
    const session = finishSession(focusSeconds, interrupted);
    if (session) {
      setLastSession(session);
      recordSession(session).catch(() => undefined);
      appendSession(session).catch(() => undefined);
    }
    setStage('task');
  };

  const handleReset = () => {
    setPendingTask(null);
    setLastSession(null);
    setStage('task');
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View style={styles.content}>
        {tab === 'timer' && (
          <>
            {stage === 'task' && <TaskInput onStart={handleStart} />}
            {stage === 'timer' && pendingTask && (
              <FocusTimer
                taskName={pendingTask.taskName}
                targetSeconds={pendingTask.targetSeconds}
                onComplete={handleComplete}
                onStop={handleStop}
              />
            )}
            {stage === 'complete' && (
              <Complete session={lastSession} onReset={handleReset} />
            )}
            <NudgeModal
              visible={stage === 'nudge'}
              onConfirm={handleNudgeContinue}
              onSkip={handleNudgeContinue}
            />
          </>
        )}
        {tab === 'stats' && <Stats />}
        {tab === 'tasks' && <Tasks />}
        {tab === 'settings' && <Settings />}
      </View>

      <View
        style={[
          styles.tabBar,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        {tabItems.map(item => {
          const selected = tab === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => setTab(item.key)}
              style={({ pressed }) => [
                styles.tabItem,
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: selected ? theme.colors.primary : theme.colors.muted,
                    fontWeight: selected ? '800' : '600',
                  },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
});
