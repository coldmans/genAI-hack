import React, { useState, useEffect } from 'react';
import { AlertCard } from './components/AlertCard';
import { ChatSection } from './components/ChatSection';
import { Onboarding } from './components/Onboarding';
import { Bell, Menu, User, RefreshCw, Settings } from 'lucide-react';

// 사용자 프로필 타입
interface UserProfile {
  businessType: string;
  location: string;
  interests: string[];
  businessSize: string;
}

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

// 로컬스토리지에서 프로필 가져오기
function getStoredProfile(): UserProfile | null {
  const stored = localStorage.getItem('userProfile');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(getStoredProfile());
  const [activeTab, setActiveTab] = useState<'alerts' | 'chat'>('chat');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 온보딩이 필요한지 확인
  const needsOnboarding = !userProfile;

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

  // 정책 데이터 가져오기 (AI 필터링 적용)
  const fetchPolicies = async () => {
    setLoading(true);
    setError(null);

    try {
      // filtered=true로 AI 맞춤 필터링 적용
      const response = await fetch('/api/policies?limit=10&filtered=true');
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

  // 브라우저 알림 보내기
  const sendNotification = (alert: Alert) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('📢 사장님 맞춤 알림', {
        body: alert.title,
        icon: '/favicon.ico',
        tag: alert.id,
      });

      notification.onclick = () => {
        window.focus();
        if (alert.url) {
          window.open(alert.url, '_blank');
        }
      };
    }
  };

  // 알림 권한 요청
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('[Notification] Permission:', permission);
    }
  };

  // 온보딩 완료 핸들러
  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    console.log('[Profile] User profile saved:', profile);
  };

  // 프로필 초기화 (다시 온보딩)
  const resetProfile = () => {
    localStorage.removeItem('userProfile');
    setUserProfile(null);
  };

  // 컴포넌트 마운트 시 데이터 가져오기 + 5분마다 자동 새로고침 (시연용)
  useEffect(() => {
    if (needsOnboarding) return;

    // 알림 권한 요청
    requestNotificationPermission();
    fetchPolicies();

    // 5분(300,000ms)마다 자동 새로고침 및 알림
    const interval = setInterval(async () => {
      console.log('[Auto Refresh] Fetching new policies...');

      try {
        const response = await fetch('/api/policies?limit=5&filtered=true');
        const data = await response.json();

        if (data.success && data.policies && data.policies.length > 0) {
          const convertedAlerts = data.policies.map(policyToAlert);
          setAlerts(convertedAlerts);

          // 첫 번째 알림 보내기
          if (convertedAlerts.length > 0) {
            sendNotification(convertedAlerts[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch policies:', err);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [needsOnboarding]);

  const handleAlertClick = (alert: Alert) => {
    if (alert.url) {
      window.open(alert.url, '_blank');
    } else {
      setActiveTab('chat');
    }
  };

  // 온보딩이 필요하면 온보딩 화면 표시
  if (needsOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

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
            <button onClick={resetProfile} className="header-icon-btn" title="프로필 재설정">
              <Settings className="header-icon" />
            </button>
          </div>
        </div>
        {/* 사용자 프로필 표시 */}
        <div className="profile-badge">
          <span>{userProfile?.businessType}</span>
          <span>•</span>
          <span>{userProfile?.location}</span>
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
