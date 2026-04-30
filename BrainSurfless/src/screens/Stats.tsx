import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import BarChart from '../components/BarChart';
import { useTheme } from '../theme/ThemeContext';
import {
  calcAvgFocusScore,
  calcByDayOfWeekMinutes,
  calcByTimeOfDaySeconds,
  calcStreak,
  filterSessions,
  formatHours,
  loadSessions,
  Period,
} from '../storage/sessions';

export default function Stats() {
  const { theme } = useTheme();
  const [period, setPeriod] = useState<Period>('week');
  const [sessions, setSessions] = useState<Awaited<ReturnType<typeof loadSessions>>>([]);

  useEffect(() => {
    loadSessions()
      .then(setSessions)
      .catch(() => setSessions([]));
  }, []);

  const filtered = useMemo(
    () => filterSessions(sessions, period),
    [period, sessions],
  );
  const totalFocusSeconds = useMemo(
    () => filtered.reduce((acc, session) => acc + session.focusDuration, 0),
    [filtered],
  );
  const totalSessions = filtered.length;

  const byDow = useMemo(() => calcByDayOfWeekMinutes(filtered), [filtered]);
  const timeOfDay = useMemo(() => calcByTimeOfDaySeconds(filtered), [filtered]);
  const streak = useMemo(() => calcStreak(sessions), [sessions]);
  const avgScore = useMemo(() => calcAvgFocusScore(filtered), [filtered]);
  const totalPoints = useMemo(
    () => sessions.reduce((acc, session) => acc + (session.pointsEarned ?? 0), 0),
    [sessions],
  );

  const timeOfDayMax = useMemo(
    () => Math.max(timeOfDay.morning, timeOfDay.afternoon, timeOfDay.night, 1),
    [timeOfDay],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.header, { color: theme.colors.text }]}>統計</Text>

        <View style={styles.tabs}>
          {(
            [
              { key: 'today', label: '今日' },
              { key: 'week', label: '今週' },
              { key: 'month', label: '今月' },
              { key: 'all', label: '全期間' },
            ] as const
          ).map(item => {
            const selected = period === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => setPeriod(item.key)}
                style={({ pressed }) => [
                  styles.tab,
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
                    styles.tabText,
                    {
                      color: selected
                        ? theme.colors.primaryText
                        : theme.colors.text,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.metricsRow}>
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.metricValue, { color: theme.colors.text }]}>
              {formatHours(totalFocusSeconds)}
            </Text>
            <Text style={[styles.metricLabel, { color: theme.colors.muted }]}>
              {period === 'today' ? '今日の' : period === 'week' ? '今週の' : period === 'month' ? '今月の' : '全期間の'}集中時間
            </Text>
          </View>
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.metricValue, { color: theme.colors.text }]}>
              {totalSessions}
            </Text>
            <Text style={[styles.metricLabel, { color: theme.colors.muted }]}>
              セッション数
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>曜日別（分）</Text>
          <BarChart
            data={byDow}
            labels={['月', '火', '水', '木', '金', '土', '日']}
            primaryColor={theme.colors.primary}
            mutedColor={theme.colors.track}
            labelColor={theme.colors.muted}
            highlightIndex={(new Date().getDay() + 6) % 7}
          />
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>よく集中した時間帯</Text>

          {(
            [
              { label: '朝 6-9時', value: timeOfDay.morning },
              { label: '昼12-15時', value: timeOfDay.afternoon },
              { label: '夜20-23時', value: timeOfDay.night },
            ] as const
          ).map(item => {
            const ratio = item.value / timeOfDayMax;
            return (
              <View key={item.label} style={styles.timeRow}>
                <Text style={[styles.timeLabel, { color: theme.colors.muted }]}>
                  {item.label}
                </Text>
                <View
                  style={[
                    styles.timeTrack,
                    { backgroundColor: theme.colors.track },
                  ]}
                >
                  <View
                    style={[
                      styles.timeFill,
                      {
                        width: `${Math.round(ratio * 100)}%`,
                        backgroundColor: theme.colors.primary,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>ストリーク</Text>
          <Text style={[styles.bigLine, { color: theme.colors.text }]}>🔥 連続集中 {streak}日</Text>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>集中スコア（平均）</Text>
          <View style={styles.scoreRow}>
            <View style={[styles.scoreTrack, { backgroundColor: theme.colors.track }]}>
              <View
                style={[
                  styles.scoreFill,
                  {
                    width: `${avgScore}%`,
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={[styles.scoreText, { color: theme.colors.text }]}>
              {avgScore}点
            </Text>
          </View>
          <Text style={[styles.hint, { color: theme.colors.muted }]}>※中断回数が少ないほど高い</Text>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>ポイント残高</Text>
          <Text style={[styles.bigLine, { color: theme.colors.text }]}>💰 {totalPoints} pt</Text>
          <Text style={[styles.hint, { color: theme.colors.muted }]}>※広告実装後に加算されます</Text>
        </View>
      </ScrollView>
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
    marginBottom: 14,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  metricsRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginRight: 10,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeLabel: {
    width: 84,
    fontSize: 12,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  timeTrack: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  timeFill: {
    height: '100%',
    borderRadius: 999,
  },
  bigLine: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreTrack: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    marginRight: 10,
  },
  scoreFill: {
    height: '100%',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'MPLUSRounded1c-Thin',
  },
  hint: {
    fontSize: 12,
    fontFamily: 'MPLUSRounded1c-Thin',
  },
});
