import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE } from '../utils/constants';
import type { IndicatorData, RiskData, HistoryEntry } from '../utils/riskCalculator';

interface IndicatorsResponse {
  core: IndicatorData[];
  extended: IndicatorData[];
  updated_at: string;
}

export function useIndicators(pollInterval = 60000) {
  const [core, setCore] = useState<IndicatorData[]>([]);
  const [extended, setExtended] = useState<IndicatorData[]>([]);
  const [updatedAt, setUpdatedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/indicators`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: IndicatorsResponse = await res.json();
      setCore(data.core);
      setExtended(data.extended);
      setUpdatedAt(data.updated_at);
      setError(null);
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    // 실패 시 3초 간격 재시도, 성공하면 정상 폴링으로 전환
    async function init() {
      const ok = await fetchData();
      if (!ok && !cancelled) {
        retryRef.current = setTimeout(init, 3000);
        return;
      }
    }
    init();

    const interval = setInterval(fetchData, pollInterval);
    return () => {
      cancelled = true;
      clearTimeout(retryRef.current);
      clearInterval(interval);
    };
  }, [fetchData, pollInterval]);

  return { core, extended, updatedAt, loading, error, refetch: fetchData };
}

export function useRiskLevel() {
  const [risk, setRisk] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const retryRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchRisk = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/risk-level`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setRisk(await res.json());
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const ok = await fetchRisk();
      if (!ok && !cancelled) {
        retryRef.current = setTimeout(init, 3000);
        return;
      }
    }
    init();

    const interval = setInterval(fetchRisk, 60000);
    return () => {
      cancelled = true;
      clearTimeout(retryRef.current);
      clearInterval(interval);
    };
  }, [fetchRisk]);

  return { risk, loading, refetch: fetchRisk };
}

export function useHistory(days = 30) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function load() {
      try {
        const r = await fetch(`${API_BASE}/history?days=${days}`);
        if (!r.ok) throw new Error();
        setHistory(await r.json());
      } catch {
        if (!cancelled) { timer = setTimeout(load, 3000); return; }
      } finally {
        setLoading(false);
      }
    }
    load();

    return () => { cancelled = true; clearTimeout(timer); };
  }, [days]);

  return { history, loading };
}
