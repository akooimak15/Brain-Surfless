import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import Complete from './src/screens/Complete';
import FocusTimer from './src/screens/FocusTimer';
import NudgeModal from './src/screens/NudgeModal';
import TaskInput from './src/screens/TaskInput';
import { recordSession } from './src/api/sessions';
import { Session, useSession } from './src/hooks/useSession';

type Stage = 'task' | 'nudge' | 'timer' | 'complete';

type PendingTask = {
  taskName: string;
  targetSeconds: number;
};

export default function App() {
  const [stage, setStage] = useState<Stage>('task');
  const [pendingTask, setPendingTask] = useState<PendingTask | null>(null);
  const [lastSession, setLastSession] = useState<Session | null>(null);
  const { startSession, finishSession } = useSession();

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

  const handleComplete = (focusSeconds: number, interrupted: boolean) => {
    const session = finishSession(focusSeconds, interrupted);
    if (session) {
      setLastSession(session);
      recordSession(session).catch(() => undefined);
    }
    setStage('complete');
  };

  const handleStop = (focusSeconds: number, interrupted: boolean) => {
    const session = finishSession(focusSeconds, interrupted || focusSeconds > 0);
    if (session) {
      setLastSession(session);
      recordSession(session).catch(() => undefined);
    }
    setStage('task');
  };

  const handleReset = () => {
    setPendingTask(null);
    setLastSession(null);
    setStage('task');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F4F1',
  },
});
