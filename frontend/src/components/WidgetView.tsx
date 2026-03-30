import { useState, useEffect } from 'react';
import { TrendingUp, ExternalLink } from 'lucide-react';

interface TopIndicator {
  key: string;
  label: string;
  value: number;
  score: number;
}

interface WidgetData {
  level: number;
  label: string;
  color: string;
  score: number;
  max: number;
  description: string;
  top_indicators: TopIndicator[];
  updated_at: string;
}

const CACHE_KEY = 'taco_widget_cache';

export default function WidgetView() {
  const [data, setData] = useState<WidgetData | null>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    async function fetchWidget() {
      try {
        const res = await fetch('/api/widget');
        if (!res.ok) throw new Error('fetch failed');
        const json: WidgetData = await res.json();
        setData(json);
        localStorage.setItem(CACHE_KEY, JSON.stringify(json));
      } catch {
        // keep cached data
      } finally {
        setLoading(false);
      }
    }
    fetchWidget();
    const interval = setInterval(fetchWidget, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-pulse text-text-muted text-sm">로딩 중...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <p className="text-text-muted text-sm">데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const pct = Math.round((data.score / data.max) * 100);

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm toss-card p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" style={{ color: data.color }} />
            <span className="text-sm font-bold text-text-primary">TACO 지수</span>
          </div>
          <div
            className="px-2 py-0.5 rounded-md text-xs font-semibold"
            style={{ backgroundColor: data.color + '20', color: data.color }}
          >
            Lv.{data.level} {data.label}
          </div>
        </div>

        {/* Score */}
        <div className="text-center">
          <div className="text-4xl font-bold text-text-primary" style={{ color: data.color }}>
            {data.score.toFixed(1)}
          </div>
          <div className="text-xs text-text-muted mt-1">/ {data.max.toFixed(1)}</div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-bg-card-hover rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: data.color }}
          />
        </div>

        {/* Description */}
        <p className="text-xs text-text-secondary text-center leading-relaxed">
          {data.description}
        </p>

        {/* Top Indicators */}
        {data.top_indicators.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-text-muted">주요 압박 지표</div>
            {data.top_indicators.map((ind) => (
              <div
                key={ind.key}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-text-secondary">{ind.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-text-primary font-medium">{ind.value}</span>
                  <div
                    className="w-10 h-1.5 bg-bg-card-hover rounded-full overflow-hidden"
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round(ind.score * 100)}%`,
                        backgroundColor: data.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Update Time + Full View Link */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-[10px] text-text-muted">
            {data.updated_at.replace('T', ' ').slice(0, 16)}
          </span>
          <a
            href="/"
            className="flex items-center gap-1 text-xs text-accent font-medium hover:underline"
          >
            전체 보기 <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
