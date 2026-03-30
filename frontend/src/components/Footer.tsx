import { Eye } from 'lucide-react';
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
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <span className="text-[10px] text-text-muted">
            tacotrump &copy; 2026
          </span>
          {views !== null && views > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-text-muted">
              <Eye size={12} />
              {views.toLocaleString()}
            </span>
          )}
          <a
            href="https://www.threads.com/@findawesomething"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-text-secondary hover:text-accent transition-colors"
          >
            @findawesomething
          </a>
        </div>
      </div>
    </footer>
  );
}
