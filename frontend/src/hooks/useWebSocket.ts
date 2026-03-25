import { useEffect, useRef, useState } from 'react';
import { WS_URL } from '../utils/constants';

interface WSMessage {
  type: string;
  total_score?: number;
  risk_level?: number;
  timestamp?: string;
}

export function useWebSocket(onMessage?: (data: WSMessage) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // 서버리스 환경에서는 WebSocket 비활성화
    if (!WS_URL) return;

    let reconnectTimer: ReturnType<typeof setTimeout>;

    function connect() {
      try {
        const ws = new WebSocket(WS_URL!);
        wsRef.current = ws;

        ws.onopen = () => setConnected(true);

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            onMessage?.(data);
          } catch {}
        };

        ws.onclose = () => {
          setConnected(false);
          reconnectTimer = setTimeout(connect, 5000);
        };

        ws.onerror = () => ws.close();
      } catch {
        reconnectTimer = setTimeout(connect, 5000);
      }
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, [onMessage]);

  return { connected };
}
