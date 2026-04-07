import { Eye, Code } from 'lucide-react';
import { usePageViews } from '../hooks/usePageViews';
import { useI18n } from '../i18n';

export default function Footer() {
  const views = usePageViews();
  const { t } = useI18n();

  return (
    <footer className="mt-auto bg-bg-card border-t border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
        <p className="text-[11px] leading-relaxed max-w-3xl text-text-muted">
          <span className="text-text-secondary font-medium">{t('footer.disclaimer')}</span>{' '}
          {t('footer.disclaimerText')}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 pt-3 border-t border-border text-[10px]">
          <span className="text-text-muted">tacotrump &copy; 2026</span>
          {views !== null && views > 0 && (
            <span className="flex items-center gap-1 text-text-muted">
              <Eye size={12} />
              {views.toLocaleString()}
            </span>
          )}
          <span className="text-border hidden sm:inline">|</span>
          <a href="#/about" className="text-text-secondary hover:text-accent transition-colors">{t('about.title')}</a>
          <a href="#/privacy" className="text-text-secondary hover:text-accent transition-colors">{t('privacy.title')}</a>
          <a href="#/terms" className="text-text-secondary hover:text-accent transition-colors">{t('terms.title')}</a>
          <a href="#/developer" className="flex items-center gap-1 text-text-secondary hover:text-accent transition-colors">
            <Code size={12} />
            API
          </a>
          <a
            href="https://www.threads.com/@findawesomething"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-accent transition-colors"
          >
            @findawesomething
          </a>
        </div>
      </div>
    </footer>
  );
}
