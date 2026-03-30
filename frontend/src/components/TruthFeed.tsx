import type { TruthPost } from '../hooks/useTruths';
import { useI18n } from '../i18n';

interface TruthFeedProps {
  posts: TruthPost[];
  loading: boolean;
}

function useTimeAgo() {
  const { t } = useI18n();

  return (dateStr: string): string => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return t('time.justNow');
      if (mins < 60) return t('time.minutesAgo', { n: mins });
      const hours = Math.floor(mins / 60);
      if (hours < 24) return t('time.hoursAgo', { n: hours });
      const days = Math.floor(hours / 24);
      return t('time.daysAgo', { n: days });
    } catch {
      return '';
    }
  };
}

export default function TruthFeed({ posts, loading }: TruthFeedProps) {
  const { t } = useI18n();
  const timeAgo = useTimeAgo();

  if (loading) {
    return (
      <section>
        <h2 className="text-lg font-bold text-text-primary mb-4">
          Trump Truth Social
        </h2>
        <div className="toss-card p-5 animate-pulse">
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-bg-card-hover rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-bold text-text-primary mb-4">
        Trump Truth Social
      </h2>

      <div className="toss-card h-[400px] overflow-y-auto overflow-x-hidden">
        {posts.length === 0 ? (
          <div className="p-5 text-center text-text-muted text-sm">
            {t('truth.noData')}
          </div>
        ) : (
          posts.map((post, i) => (
            <a
              key={i}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-5 h-12 border-b border-border hover:bg-bg-card-hover transition-colors group min-w-0"
            >
              <span className="text-sm text-text-primary truncate flex-1 mr-3 min-w-0">
                {post.translated || post.content}
              </span>
              <span className="text-[11px] text-text-muted whitespace-nowrap shrink-0">
                {timeAgo(post.published_at)}
              </span>
            </a>
          ))
        )}
      </div>
    </section>
  );
}
