import { useCallback } from 'react';
import Header from './components/Header';
import RiskCard from './components/RiskCard';
import IndicatorGrid from './components/IndicatorGrid';
import HistoryTimeline from './components/HistoryTimeline';
import TruthFeed from './components/TruthFeed';
import Footer from './components/Footer';
import { useIndicators, useRiskLevel, useHistory } from './hooks/useIndicators';
import { useTruths } from './hooks/useTruths';
import { useWebSocket } from './hooks/useWebSocket';

export default function App() {
  const { core, updatedAt, loading: indLoading, refetch } = useIndicators();
  const { risk, loading: riskLoading, refetch: refetchRisk } = useRiskLevel();
  const { history, loading: histLoading } = useHistory(7);
  const { posts: truths, loading: truthsLoading } = useTruths();

  const handleWSMessage = useCallback(() => {
    refetch();
    refetchRisk();
  }, [refetch, refetchRisk]);

  const { connected } = useWebSocket(handleWSMessage);

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary">
      <Header
        riskLevel={risk?.level ?? 1}
        updatedAt={updatedAt}
      />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <RiskCard risk={risk} loading={riskLoading} />
        <IndicatorGrid indicators={core} loading={indLoading} />
        <TruthFeed posts={truths} loading={truthsLoading} />
        <HistoryTimeline history={history} loading={histLoading} />
      </main>

      <Footer />
    </div>
  );
}
