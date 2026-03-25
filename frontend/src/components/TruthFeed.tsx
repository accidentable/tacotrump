import type { TruthPost } from '../hooks/useTruths';

interface TruthFeedProps {
  posts: TruthPost[];
  loading: boolean;
}

function timeAgo(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '방금 전';
    if (mins < 60) return `${mins}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
  } catch {
    return '';
  }
}

export default function TruthFeed({ posts, loading }: TruthFeedProps) {
  if (loading) {
    return (
      <section>
        <h2 className="text-sm font-semibold text-text-primary mb-3 border-b-2 border-accent pb-1.5">
          Trump Truth Social
        </h2>
        <div className="bg-bg-card border border-border rounded-lg p-5 animate-pulse">
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-bg-card-hover rounded" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-sm font-semibold text-text-primary mb-3 border-b-2 border-accent pb-1.5">
        Trump Truth Social
      </h2>

      <div className="bg-bg-card border border-border rounded-lg h-[400px] overflow-y-auto overflow-x-hidden">
        {posts.length === 0 ? (
          <div className="p-5 text-center text-text-muted text-sm">
            데이터를 불러올 수 없습니다
          </div>
        ) : (
          posts.map((post, i) => (
            <a
              key={i}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 h-12 border-b border-border hover:bg-bg-card-hover transition-colors group min-w-0"
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
