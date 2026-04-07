import { useState } from 'react';
import { Key, Copy, Check, ArrowLeft, Code, Zap, Shield } from 'lucide-react';

const API_BASE = '/api';

interface ApiKeyInfo {
  api_key?: string;
  email: string;
  app_name: string;
  created_at: string;
  daily_limit: number;
}

interface KeyListItem {
  key_hash: string;
  app_name: string;
  created_at: string;
  active: boolean;
  daily_limit: number;
  today_usage: number;
}

export default function DeveloperPortal({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [appName, setAppName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<ApiKeyInfo | null>(null);
  const [keys, setKeys] = useState<KeyListItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'register' | 'docs'>('register');

  const handleRegister = async () => {
    if (!email) { setError('이메일을 입력하세요.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/developer/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, app_name: appName }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed'); return; }
      setGeneratedKey(data.data);
      fetchKeys();
    } catch { setError('서버 연결 실패'); } finally { setLoading(false); }
  };

  const fetchKeys = async () => {
    if (!email) return;
    try {
      const res = await fetch(`${API_BASE}/developer/keys?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.keys) setKeys(data.keys);
    } catch { /* ignore */ }
  };

  const copyKey = () => {
    if (generatedKey?.api_key) {
      navigator.clipboard.writeText(generatedKey.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="bg-bg-header border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14 gap-3">
            <button onClick={onBack} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card-hover transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <Key className="w-5 h-5 text-accent" />
            <h1 className="text-lg font-bold text-text-primary">TACO API</h1>
            <span className="text-text-muted text-xs">Developer Portal</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold text-text-primary">TACO Index API</h2>
          <p className="text-text-secondary text-sm max-w-lg mx-auto">
            트럼프 정책 리스크 지표를 실시간으로 조회할 수 있는 REST API입니다.
            무료로 API 키를 발급받고 바로 시작하세요.
          </p>
          <div className="flex justify-center gap-6 text-xs text-text-muted pt-2">
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-yellow-500" /> 실시간 데이터</span>
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-green-500" /> 일 1,000회 무료</span>
            <span className="flex items-center gap-1"><Code className="w-3.5 h-3.5 text-blue-500" /> REST JSON</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-bg-card rounded-xl p-1 w-fit mx-auto">
          <button onClick={() => setTab('register')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'register' ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary'}`}>
            키 발급
          </button>
          <button onClick={() => setTab('docs')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'docs' ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary'}`}>
            API 문서
          </button>
        </div>

        {tab === 'register' ? (
          <div className="space-y-6">
            {/* Register Form */}
            <div className="toss-card p-6 space-y-4">
              <h3 className="text-base font-semibold text-text-primary">API 키 발급</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">이메일 *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                    className="w-full px-3 py-2.5 rounded-xl bg-bg-primary border border-border text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">앱 이름 (선택)</label>
                  <input type="text" value={appName} onChange={e => setAppName(e.target.value)} placeholder="My Trading Bot"
                    className="w-full px-3 py-2.5 rounded-xl bg-bg-primary border border-border text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50" />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <button onClick={handleRegister} disabled={loading}
                  className="w-full py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50">
                  {loading ? '발급 중...' : 'API 키 발급받기'}
                </button>
              </div>
            </div>

            {/* Generated Key */}
            {generatedKey?.api_key && (
              <div className="toss-card p-6 space-y-3 border-2 border-green-400/30">
                <h3 className="text-base font-semibold text-green-600 flex items-center gap-2">
                  <Check className="w-4 h-4" /> API 키가 발급되었습니다
                </h3>
                <p className="text-xs text-text-muted">이 키는 다시 표시되지 않으니 안전하게 보관하세요.</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2.5 rounded-xl bg-bg-primary border border-border text-sm text-text-primary font-mono break-all select-all">
                    {generatedKey.api_key}
                  </code>
                  <button onClick={copyKey} className="p-2.5 rounded-xl bg-bg-primary border border-border hover:bg-bg-card-hover transition-colors">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-text-muted" />}
                  </button>
                </div>
              </div>
            )}

            {/* Key List */}
            {keys.length > 0 && (
              <div className="toss-card p-6 space-y-3">
                <h3 className="text-base font-semibold text-text-primary">내 API 키</h3>
                <div className="space-y-2">
                  {keys.map((k, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-bg-primary border border-border">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-mono text-text-primary truncate">{k.key_hash}</div>
                        <div className="text-xs text-text-muted">{k.app_name || '(이름 없음)'} &middot; {k.today_usage}/{k.daily_limit} today</div>
                      </div>
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${k.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {k.active ? 'Active' : 'Revoked'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* API Docs */
          <div className="space-y-6">
            <DocSection title="인증" description="모든 API 요청에는 API 키가 필요합니다.">
              <CodeBlock>{`# Header 방식 (권장)
curl -H "X-API-Key: taco_your_key_here" \\
  https://tacotrump.space/api/v1/risk-level

# Query Parameter 방식
curl "https://tacotrump.space/api/v1/risk-level?api_key=taco_your_key_here"`}</CodeBlock>
            </DocSection>

            <DocSection title="GET /api/v1/risk-level" description="현재 TACO 종합 위험도를 반환합니다.">
              <CodeBlock>{`{
  "total_score": 2.45,
  "max_score": 6.0,
  "level": 2,
  "label": "주의",
  "color": "#FFC84C",
  "description": "시장이 흔들리기 시작..."
}`}</CodeBlock>
            </DocSection>

            <DocSection title="GET /api/v1/indicators" description="6개 핵심 지표의 상세 데이터를 반환합니다.">
              <CodeBlock>{`{
  "indicators": [
    {
      "key": "sp500",
      "label": "E-mini S&P 선물 (고점대비)",
      "value": -5.2,
      "prev_value": -4.8,
      "change": -0.4,
      "change_pct": -8.33,
      "unit": "%",
      "redline": -15.0,
      "score": 0.18
    }
    // ... 5 more indicators
  ],
  "total_score": 2.45,
  "max_score": 6.0,
  "updated_at": "2025-03-30T14:30:00+09:00"
}`}</CodeBlock>
            </DocSection>

            <DocSection title="GET /api/v1/history" description="과거 일별 점수 히스토리를 반환합니다.">
              <p className="text-xs text-text-muted mb-2">Query: <code className="bg-bg-primary px-1.5 py-0.5 rounded">days</code> (1~90, 기본 7)</p>
              <CodeBlock>{`// GET /api/v1/history?days=30&api_key=taco_...
{
  "history": [
    {
      "timestamp": "2025-03-25T00:00:00+09:00",
      "total_score": 2.31,
      "risk_level": 2,
      "sp500": -4.1,
      "vix": 19.5,
      "treasury_10y": 4.28,
      "oil": 69.50,
      "dollar_index": 99.80
    }
  ],
  "days": 30
}`}</CodeBlock>
            </DocSection>

            <DocSection title="Rate Limiting" description="일일 1,000회 요청 제한. 응답에 남은 횟수가 포함됩니다.">
              <CodeBlock>{`// 응답에 포함되는 rate limit 정보
"_rate_limit": {
  "remaining": 997,
  "daily_limit": 1000
}

// 초과 시 429 응답
{ "error": "Rate limit exceeded.", "daily_limit": 1000 }`}</CodeBlock>
            </DocSection>

            <DocSection title="에러 응답" description="모든 에러는 동일한 형식입니다.">
              <CodeBlock>{`// 401 — 키 누락
{ "error": "API key required..." }

// 403 — 유효하지 않은 키
{ "error": "Invalid or revoked API key." }

// 429 — Rate limit 초과
{ "error": "Rate limit exceeded.", "daily_limit": 1000 }

// 500 — 서버 에러
{ "error": "Failed to fetch indicator data" }`}</CodeBlock>
            </DocSection>
          </div>
        )}
      </main>
    </div>
  );
}

function DocSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="toss-card p-6 space-y-3">
      <h3 className="text-base font-semibold text-text-primary font-mono">{title}</h3>
      <p className="text-sm text-text-secondary">{description}</p>
      {children}
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="px-4 py-3 rounded-xl bg-gray-900 text-gray-100 text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed">
      {children}
    </pre>
  );
}
