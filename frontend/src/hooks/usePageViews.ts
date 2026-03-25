import { useState, useEffect } from 'react';
import { API_BASE } from '../utils/constants';

export function usePageViews() {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem('taco_views');
    if (cached) {
      setViews(parseInt(cached, 10));
      return;
    }

    fetch(`${API_BASE}/pageviews`)
      .then(r => r.json())
      .then(data => {
        if (data.views > 0) {
          setViews(data.views);
          sessionStorage.setItem('taco_views', String(data.views));
        }
      })
      .catch(() => {});
  }, []);

  return views;
}
