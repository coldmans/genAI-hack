import React, { useState } from 'react';
import { AlertCard } from './components/AlertCard';
import { ChatSection } from './components/ChatSection';
import { Bell, Menu, User } from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  dDay?: number;
  category: string;
  urgent: boolean;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'alerts' | 'chat'>('chat');

  const alerts: Alert[] = [
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
              <span className="badge">3</span>
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
            <h2 className="section-title">오늘의 주요 알림</h2>
            <div className="alerts-list">
              {alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onClick={() => setActiveTab('chat')}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
