import { useSyncExternalStore } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { HistoryEntry } from '../utils/riskCalculator';
import { RISK_LEVELS } from '../utils/constants';

function useDarkMode() {
  return useSyncExternalStore(
    (cb) => {
      const obs = new MutationObserver(cb);
      obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      return () => obs.disconnect();
    },
    () => document.documentElement.classList.contains('dark'),
  );
}

const COLORS = {
  light: {
    grid: '#E5E8EB',
    tick: '#8B95A1',
    axis: '#D1D6DB',
    line: '#3182F6',
    tooltipBg: '#FFFFFF',
    tooltipBorder: '#E5E8EB',
    tooltipText: '#191F28',
    tooltipLabel: '#4E5968',
    dotStroke: '#fff',
  },
  dark: {
    grid: '#2C2F36',
    tick: '#6B7280',
    axis: '#3B3F48',
    line: '#4E9AFF',
    tooltipBg: '#1B1D23',
    tooltipBorder: '#2C2F36',
    tooltipText: '#ECECEC',
    tooltipLabel: '#A0A6B1',
    dotStroke: '#1B1D23',
  },
} as const;

interface HistoryTimelineProps {
  history: HistoryEntry[];
  loading: boolean;
  currentScore?: number;
}

export default function HistoryTimeline({ history, loading, currentScore }: HistoryTimelineProps) {
  const isDark = useDarkMode();
  const c = isDark ? COLORS.dark : COLORS.light;

  if (loading) {
    return (
      <section>
        <h2 className="text-lg font-bold text-text-primary mb-4">
          위험도 추이
        </h2>
        <div className="toss-card p-5 animate-pulse">
          <div className="h-64 bg-bg-card-hover rounded-xl" />
        </div>
      </section>
    );
  }

  const chartData = history.map(entry => ({
    ...entry,
    time: formatTimestamp(entry.timestamp),
    score: entry.total_score,
  }));

  // 현재 라이브 타코지수를 "지금"으로 추가
  if (currentScore != null) {
    chartData.push({ time: '지금', score: currentScore } as typeof chartData[number]);
  }

  return (
    <section>
      <h2 className="text-lg font-bold text-text-primary mb-4">
        위험도 추이
      </h2>

      <div className="toss-card p-5">
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-text-muted text-sm">
            데이터 수집 중...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={c.grid}
                vertical={false}
              />
              <XAxis
                dataKey="time"
                tick={{ fill: c.tick, fontSize: 11 }}
                axisLine={{ stroke: c.axis }}
                tickLine={{ stroke: c.axis }}
              />
              <YAxis
                domain={[0, 6]}
                ticks={[0, 1.8, 3.0, 4.2, 6]}
                tick={{ fill: c.tick, fontSize: 11 }}
                axisLine={{ stroke: c.axis }}
                tickLine={{ stroke: c.axis }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: c.tooltipBg,
                  border: `1px solid ${c.tooltipBorder}`,
                  borderRadius: '12px',
                  color: c.tooltipText,
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                labelStyle={{ color: c.tooltipLabel, fontWeight: 500 }}
                formatter={(value) => [Number(value).toFixed(2), '종합 점수']}
              />
              <ReferenceLine y={1.8} stroke={RISK_LEVELS[2].color} strokeDasharray="5 5" strokeOpacity={0.4} />
              <ReferenceLine y={3.0} stroke={RISK_LEVELS[3].color} strokeDasharray="5 5" strokeOpacity={0.4} />
              <ReferenceLine y={4.2} stroke={RISK_LEVELS[4].color} strokeDasharray="5 5" strokeOpacity={0.4} />
              <Line
                type="monotone"
                dataKey="score"
                stroke={c.line}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: c.line, stroke: c.dotStroke, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  } catch {
    return '';
  }
}
