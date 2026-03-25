import { useState, useEffect } from 'react';
import { API_BASE } from '../utils/constants';

export interface TruthPost {
  content: string;
  translated?: string;
  title: string;
  link: string;
  published_at: string;
}

export function useTruths() {
  const [posts, setPosts] = useState<TruthPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function load() {
      try {
        const r = await fetch(`${API_BASE}/truths`);
        if (!r.ok) throw new Error();
        const data = await r.json();
        if (!cancelled) setPosts(data);
      } catch {
        if (!cancelled) { timer = setTimeout(load, 5000); return; }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();

    // 5분마다 갱신
    const interval = setInterval(load, 300000);
    return () => { cancelled = true; clearTimeout(timer); clearInterval(interval); };
  }, []);

  return { posts, loading };
}
