import { useCallback, useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Clock } from 'lucide-react';
import Header from './components/Header';
import RiskCard from './components/RiskCard';
import IndicatorGrid from './components/IndicatorGrid';
import ExtendedIndicators from './components/ExtendedIndicators';
import ShareButton from './components/ShareButton';
import NotificationCTA from './components/NotificationCTA';
import HistoryTimeline from './components/HistoryTimeline';
import Footer from './components/Footer';
import DeveloperPortal from './components/DeveloperPortal';
import { AboutPage, PrivacyPage, TermsPage } from './components/LegalPage';
import { useIndicators, useRiskLevel, useHistory } from './hooks/useIndicators';
import { useWebSocket } from './hooks/useWebSocket';
import { useI18n } from './i18n';

function formatTime(s: string, locale: string) {
  if (!s || s === 'N/A') return '--:--';
  if (s.includes('KST')) return s.replace(' KST', '').trim();
  try {
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleTimeString(locale === 'ko' ? 'ko-KR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return s;
  }
}

export default function App() {
  type Page = 'main' | 'developer' | 'about' | 'privacy' | 'terms';

  const hashToPage = (hash: string): Page => {
    const map: Record<string, Page> = {
      '#/developer': 'developer',
      '#/about': 'about',
      '#/privacy': 'privacy',
      '#/terms': 'terms',
    };
    return map[hash] || 'main';
  };

  const [page, setPage] = useState<Page>(() => hashToPage(window.location.hash));

  useEffect(() => {
    const onHash = () => setPage(hashToPage(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const { core, extended, updatedAt, loading: indLoading, refetch } = useIndicators();
  const { risk, loading: riskLoading, refetch: refetchRisk } = useRiskLevel();
  const { history, loading: histLoading } = useHistory(7);
  const { t, locale } = useI18n();

  const handleWSMessage = useCallback(() => {
    refetch();
    refetchRisk();
  }, [refetch, refetchRisk]);

  useWebSocket(handleWSMessage);

  const goMain = () => { window.location.hash = ''; setPage('main'); };

  if (page !== 'main') {
    const SubPage = { developer: DeveloperPortal, about: AboutPage, privacy: PrivacyPage, terms: TermsPage }[page];
    return (
      <>
        <SubPage onBack={goMain} />
        <Analytics />
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary">
      <Header riskLevel={risk?.level ?? 1} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <NotificationCTA />

        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Clock className="w-3.5 h-3.5" />
          <span>{t('app.lastUpdate')}: {formatTime(updatedAt, locale)}</span>
        </div>

        <RiskCard risk={risk} loading={riskLoading} />
        <IndicatorGrid indicators={core} loading={indLoading} />
        <ExtendedIndicators indicators={extended} />
        <ShareButton riskLevel={risk?.level ?? 1} />
        <HistoryTimeline history={history} loading={histLoading} currentScore={risk?.total_score} />
      </main>

      <Footer />
      <Analytics />
    </div>
  );
}
