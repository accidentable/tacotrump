import { useCallback } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Clock } from 'lucide-react';
import Header from './components/Header';
import RiskCard from './components/RiskCard';
import IndicatorGrid from './components/IndicatorGrid';
import ExtendedIndicators from './components/ExtendedIndicators';
import ShareButton from './components/ShareButton';
import HistoryTimeline from './components/HistoryTimeline';
import Footer from './components/Footer';
import { useIndicators, useRiskLevel, useHistory } from './hooks/useIndicators';
import { useWebSocket } from './hooks/useWebSocket';

function formatTime(s: string) {
  if (!s || s === 'N/A') return '--:--';
  if (s.includes('KST')) return s.replace(' KST', '').trim();
  try {
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return s;
  }
}

export default function App() {
  const { core, extended, updatedAt, loading: indLoading, refetch } = useIndicators();
  const { risk, loading: riskLoading, refetch: refetchRisk } = useRiskLevel();
  const { history, loading: histLoading } = useHistory(7);

  const handleWSMessage = useCallback(() => {
    refetch();
    refetchRisk();
  }, [refetch, refetchRisk]);

  useWebSocket(handleWSMessage);

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary">
      <Header riskLevel={risk?.level ?? 1} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* 업데이트 시각 */}
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Clock className="w-3.5 h-3.5" />
          <span>최근 업데이트: {formatTime(updatedAt)}</span>
        </div>

        <RiskCard risk={risk} loading={riskLoading} />
        <IndicatorGrid indicators={core} loading={indLoading} />
        <ExtendedIndicators indicators={extended} />
        <ShareButton riskLevel={risk?.level ?? 1} />
        <HistoryTimeline history={history} loading={histLoading} />
      </main>

      <Footer />
      <Analytics />
    </div>
  );
}
