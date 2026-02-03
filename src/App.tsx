import React, { useState, useEffect } from 'react';
import { AlertCard } from './components/AlertCard';
import { ChatSection } from './components/ChatSection';
import { Bell, Menu, User, RefreshCw } from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  dDay?: number;
  category: string;
  urgent: boolean;
  url?: string;
  source?: string;
}

interface PolicyFromAPI {
  id: string;
  title: string;
  category?: string;
  source: string;
  url: string;
  published_at?: string;
}

// 정책 데이터를 Alert 형태로 변환
function policyToAlert(policy: PolicyFromAPI): Alert {
  // D-Day 계산 (공개일로부터 7일 이내면 표시)
  let dDay: number | undefined;
  if (policy.published_at) {
    const publishDate = new Date(policy.published_at);
    const today = new Date();
    const diffDays = Math.ceil((publishDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= 7) {
      dDay = diffDays;
    }
  }

  return {
    id: policy.id,
    title: policy.title,
    category: policy.category || (policy.source === 'mss' ? '정책' : '뉴스'),
    urgent: dDay !== undefined && dDay <= 3,
    dDay,
    url: policy.url,
    source: policy.source
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'alerts' | 'chat'>('chat');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 기본 알림 데이터 (API 실패 시 폴백)
  const defaultAlerts: Alert[] = [
    {
      id: '1',
      title: '소상공인 손실보전금 신청 마감',
      dDay: 3,
      category: '지원금',
      urgent: true,
    },
    {
      id: '2',
      title: '최저임금 개정안 시행 안내',
      dDay: 7,
      category: '노무',
      urgent: true,
    },
    {
      id: '3',
      title: '외식업 위생등급제 신청 혜택',
      category: '제도',
      urgent: false,
    },
  ];

  // 정책 데이터 가져오기
  const fetchPolicies = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/policies?limit=10');
      const data = await response.json();

      if (data.success && data.policies && data.policies.length > 0) {
        const convertedAlerts = data.policies.map(policyToAlert);
        setAlerts(convertedAlerts);
      } else {
        // API에 데이터가 없으면 기본 알림 사용
        setAlerts(defaultAlerts);
      }
    } catch (err) {
      console.error('Failed to fetch policies:', err);
      setAlerts(defaultAlerts);
      setError('정책 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleAlertClick = (alert: Alert) => {
    if (alert.url) {
      window.open(alert.url, '_blank');
    } else {
      setActiveTab('chat');
    }
  };

  return (
    <div className="mobile-container">
      {/* 헤더 */}
      <header className="mobile-header">
        <div className="header-content">
          <div className="header-left">
            <Menu className="header-icon" />
            <h1 className="header-title">사장님 비서</h1>
          </div>
          <div className="header-right">
            <div className="notification-badge">
              <Bell className="header-icon" />
              <span className="badge">{alerts.length}</span>
            </div>
            <User className="header-icon" />
          </div>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <nav className="tab-nav">
        <button
          className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          AI 상담
        </button>
        <button
          className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          알림 ({alerts.length})
        </button>
      </nav>

      {/* 메인 컨텐츠 */}
      <main className="main-content">
        {activeTab === 'chat' ? (
          <ChatSection />
        ) : (
          <div className="alerts-section">
            <div className="section-header">
              <h2 className="section-title">오늘의 주요 알림</h2>
              <button
                className="refresh-btn"
                onClick={fetchPolicies}
                disabled={loading}
              >
                <RefreshCw className={`refresh-icon ${loading ? 'spinning' : ''}`} />
              </button>
            </div>
            {error && <p className="error-message">{error}</p>}
            <div className="alerts-list">
              {alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onClick={() => handleAlertClick(alert)}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
