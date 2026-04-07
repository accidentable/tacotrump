import { ArrowLeft } from 'lucide-react';
import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n/ko';

interface SectionProps {
  titleKey: string;
  children: React.ReactNode;
}

function Section({ titleKey, children }: SectionProps) {
  const { t } = useI18n();
  return (
    <div className="toss-card p-5 sm:p-6 space-y-2.5">
      <h3 className="text-base font-semibold text-text-primary">{t(titleKey as TranslationKey)}</h3>
      {children}
    </div>
  );
}

function P({ textKey }: { textKey: string }) {
  const { t } = useI18n();
  return <p className="text-sm text-text-secondary leading-relaxed">{t(textKey as TranslationKey)}</p>;
}

function Li({ textKey }: { textKey: string }) {
  const { t } = useI18n();
  return (
    <li className="text-sm text-text-secondary leading-relaxed pl-1">
      {t(textKey as TranslationKey)}
    </li>
  );
}

/* ── About ──────────────────────────────────────────────────── */

export function AboutPage({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const LEVEL_COLORS = ['#3CD5AF', '#FFC84C', '#F58737', '#F04452'];

  return (
    <LegalShell title={t('about.title')} onBack={onBack}>
      {/* Hero */}
      <div className="toss-card p-6 sm:p-8 text-center space-y-3">
        <span className="text-3xl">🌮</span>
        <h2 className="text-xl font-bold text-text-primary">{t('about.heroTitle')}</h2>
        <p className="text-sm text-text-secondary leading-relaxed max-w-lg mx-auto">{t('about.heroDesc')}</p>
      </div>

      <Section titleKey="about.whatTitle">
        <P textKey="about.whatDesc" />
      </Section>

      <Section titleKey="about.howTitle">
        <P textKey="about.howDesc" />
      </Section>

      <Section titleKey="about.levelTitle">
        <div className="space-y-2">
          {[1, 2, 3, 4].map(lv => (
            <div key={lv} className="flex items-start gap-2.5 px-3 py-2 rounded-xl bg-bg-primary">
              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: LEVEL_COLORS[lv - 1] }} />
              <span className="text-sm text-text-secondary leading-relaxed">
                {t(`about.level${lv}` as TranslationKey)}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section titleKey="about.dataTitle">
        <P textKey="about.dataDesc" />
      </Section>

      <Section titleKey="about.purposeTitle">
        <P textKey="about.purposeDesc" />
      </Section>

      <Section titleKey="about.contactTitle">
        <P textKey="about.contactDesc" />
      </Section>
    </LegalShell>
  );
}

/* ── Privacy Policy ─────────────────────────────────────────── */

export function PrivacyPage({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();

  return (
    <LegalShell title={t('privacy.title')} onBack={onBack}>
      <Section titleKey="privacy.introTitle">
        <P textKey="privacy.introDesc" />
      </Section>

      <Section titleKey="privacy.collectTitle">
        <ul className="space-y-2 list-disc list-outside ml-4">
          <Li textKey="privacy.collect1" />
          <Li textKey="privacy.collect2" />
          <Li textKey="privacy.collect3" />
          <Li textKey="privacy.collect4" />
        </ul>
      </Section>

      <Section titleKey="privacy.useTitle">
        <ul className="space-y-1.5 list-disc list-outside ml-4">
          <Li textKey="privacy.use1" />
          <Li textKey="privacy.use2" />
          <Li textKey="privacy.use3" />
          <Li textKey="privacy.use4" />
        </ul>
      </Section>

      <Section titleKey="privacy.thirdTitle">
        <ul className="space-y-2 list-disc list-outside ml-4">
          <Li textKey="privacy.third1" />
          <Li textKey="privacy.third2" />
          <Li textKey="privacy.third3" />
        </ul>
      </Section>

      <Section titleKey="privacy.retentionTitle">
        <P textKey="privacy.retentionDesc" />
      </Section>

      <Section titleKey="privacy.rightsTitle">
        <P textKey="privacy.rightsDesc" />
      </Section>

      <Section titleKey="privacy.adsTitle">
        <P textKey="privacy.adsDesc" />
      </Section>
    </LegalShell>
  );
}

/* ── Terms of Service ───────────────────────────────────────── */

export function TermsPage({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();

  return (
    <LegalShell title={t('terms.title')} onBack={onBack}>
      <Section titleKey="terms.introTitle">
        <P textKey="terms.introDesc" />
      </Section>

      <Section titleKey="terms.disclaimerTitle">
        <ul className="space-y-2 list-disc list-outside ml-4">
          <Li textKey="terms.disclaimer1" />
          <Li textKey="terms.disclaimer2" />
          <Li textKey="terms.disclaimer3" />
          <Li textKey="terms.disclaimer4" />
        </ul>
      </Section>

      <Section titleKey="terms.useTitle">
        <ul className="space-y-1.5 list-disc list-outside ml-4">
          <Li textKey="terms.use1" />
          <Li textKey="terms.use2" />
          <Li textKey="terms.use3" />
          <Li textKey="terms.use4" />
        </ul>
      </Section>

      <Section titleKey="terms.ipTitle">
        <P textKey="terms.ipDesc" />
      </Section>

      <Section titleKey="terms.changeTitle">
        <P textKey="terms.changeDesc" />
      </Section>

      <Section titleKey="terms.contactTitle">
        <P textKey="terms.contactDesc" />
      </Section>
    </LegalShell>
  );
}

/* ── Shell ──────────────────────────────────────────────────── */

function LegalShell({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="bg-bg-header border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14 gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card-hover transition-colors"
              aria-label={t('legal.backToMain')}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-lg font-bold text-text-primary">{title}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {children}

        <p className="text-center text-xs text-text-muted pt-4 pb-2">
          {t('legal.lastUpdated')}
        </p>
      </main>
    </div>
  );
}
