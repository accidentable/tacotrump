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

interface HistoryTimelineProps {
  history: HistoryEntry[];
  loading: boolean;
}

export default function HistoryTimeline({ history, loading }: HistoryTimelineProps) {
  if (loading) {
    return (
      <section>
        <h2 className="text-sm font-semibold text-text-primary mb-3 border-b-2 border-accent pb-1.5">
          위험도 추이 (Risk Trend)
        </h2>
        <div className="bg-bg-card border border-border rounded-lg p-5 animate-pulse">
          <div className="h-64 bg-bg-card-hover rounded" />
        </div>
      </section>
    );
  }

  const chartData = history.map(entry => ({
    ...entry,
    time: formatTimestamp(entry.timestamp),
    score: entry.total_score,
  }));

  return (
    <section>
      <h2 className="text-sm font-semibold text-text-primary mb-3 border-b-2 border-accent pb-1.5">
        위험도 추이 (Risk Trend)
      </h2>

      <div className="bg-bg-card border border-border rounded-lg p-5">
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-text-muted text-sm">
            데이터 수집 중...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E2E8F0"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                tick={{ fill: '#8899A6', fontSize: 11 }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={{ stroke: '#CBD5E1' }}
              />
              <YAxis
                domain={[0, 4]}
                ticks={[0, 1, 2, 3, 4]}
                tick={{ fill: '#8899A6', fontSize: 11 }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={{ stroke: '#CBD5E1' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  color: '#1A1A1A',
                  fontSize: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
                labelStyle={{ color: '#4A5568', fontWeight: 500 }}
                formatter={(value) => [Number(value).toFixed(2), '종합 점수']}
              />
              <ReferenceLine y={1} stroke={RISK_LEVELS[1].color} strokeDasharray="5 5" strokeOpacity={0.4} />
              <ReferenceLine y={2} stroke={RISK_LEVELS[2].color} strokeDasharray="5 5" strokeOpacity={0.4} />
              <ReferenceLine y={3} stroke={RISK_LEVELS[3].color} strokeDasharray="5 5" strokeOpacity={0.4} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#1B2A4A"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#1B2A4A', stroke: '#fff', strokeWidth: 2 }}
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
