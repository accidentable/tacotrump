import { useCallback } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header';
import RiskCard from './components/RiskCard';
import IndicatorGrid from './components/IndicatorGrid';
import ShareButton from './components/ShareButton';
import HistoryTimeline from './components/HistoryTimeline';
import Footer from './components/Footer';
import { useIndicators, useRiskLevel, useHistory } from './hooks/useIndicators';
import { useWebSocket } from './hooks/useWebSocket';

export default function App() {
  const { core, updatedAt, loading: indLoading, refetch } = useIndicators();
  const { risk, loading: riskLoading, refetch: refetchRisk } = useRiskLevel();
  const { history, loading: histLoading } = useHistory(7);

  const handleWSMessage = useCallback(() => {
    refetch();
    refetchRisk();
  }, [refetch, refetchRisk]);

  useWebSocket(handleWSMessage);

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary">
      <Header
        riskLevel={risk?.level ?? 1}
        updatedAt={updatedAt}
      />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <RiskCard risk={risk} loading={riskLoading} />
        <IndicatorGrid indicators={core} loading={indLoading} />
        <ShareButton riskLevel={risk?.level ?? 1} label={risk?.label ?? '안전'} />
        <HistoryTimeline history={history} loading={histLoading} />
      </main>

      <Footer />
      <Analytics />
    </div>
  );
}
