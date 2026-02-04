import React, { useState } from 'react';
import { BarChart3, CheckCircle, AlertTriangle, FileText, Phone, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface DemoChatProps {
    userProfile: any;
}

// 시연용 하드코딩 데이터
const DEMO_USER_INPUT = {
    businessType: '음식점업',
    annualRevenue: '3억원',
    creditScore: '753점',
    location: '인천시 부평구'
};

const POLICIES = [
    {
        id: 1,
        name: '외식업 자영업자 금융지원 협약보증',
        provider: '지역신용보증재단 (국민은행)',
        loanLimit: '5,000만원',
        interestRate: '변동금리',
        term: '5년',
        creditRequirement: 595,
        approvalRate: 85,
        fit: '매우 적합',
        fitLevel: 3,
        reason: '음식점업 특화 상품으로 최적 부합, 신용점수 158점 초과'
    },
    {
        id: 2,
        name: '스마트 혁신성장 소상공인 특례보증',
        provider: '신용보증재단중앙회 (13개 은행)',
        loanLimit: '산정방법에 따라 상이',
        interestRate: '협약금리',
        term: '최대 5년',
        creditRequirement: 710,
        approvalRate: 80,
        fit: '적합',
        fitLevel: 3,
        reason: '다양한 은행 선택 가능, 신용점수 43점 초과'
    },
    {
        id: 3,
        name: '소상공인 이자차액 보전금 지원',
        provider: '정부',
        loanLimit: '2,000만원',
        interestRate: '2% 지원',
        term: '5년',
        creditRequirement: null,
        approvalRate: 75,
        fit: '적합',
        fitLevel: 2,
        reason: '이자 부담 경감, 기존 대출 보유 여부가 변수'
    },
    {
        id: 4,
        name: '인천 중구 소상공인 특례보증',
        provider: '인천시',
        loanLimit: '명시 필요',
        interestRate: '명시 필요',
        term: '명시 필요',
        creditRequirement: null,
        approvalRate: 60,
        fit: '지역 불일치',
        fitLevel: 1,
        reason: '사업장이 부평구 (중구 아님)'
    }
];

const RISK_FACTORS = [
    { name: '지역 제한', percent: 23.1 },
    { name: '업력 증명', percent: 23.1 },
    { name: '재무 건전성', percent: 23.1 },
    { name: '기존 대출 현황', percent: 15.4 },
    { name: '임대차 계약', percent: 15.3 }
];

const REQUIRED_DOCS = [
    '사업자등록증 (부평구 소재 확인)',
    '최근 3년간 종합소득세 신고서',
    '부가가치세 과세표준증명원',
    '개인신용정보 조회서 (753점 증빙)',
    '사업장 임대차계약서',
    '통장 거래내역 (최근 6개월)'
];

export function DemoChat({ userProfile }: DemoChatProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [expandedPolicy, setExpandedPolicy] = useState<number | null>(null);
    const [showChart, setShowChart] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const [showConsultation, setShowConsultation] = useState(false);

    const handleNextStep = () => {
        setCurrentStep(prev => Math.min(prev + 1, 4));
        if (currentStep === 1) setShowChart(true);
        if (currentStep === 2) setShowGuide(true);
        if (currentStep === 3) setShowConsultation(true);
    };

    const getFitColor = (level: number) => {
        if (level === 3) return '#10B981';
        if (level === 2) return '#F59E0B';
        return '#EF4444';
    };

    const getFitBg = (level: number) => {
        if (level === 3) return '#DCFCE7';
        if (level === 2) return '#FEF3C7';
        return '#FEE2E2';
    };

    return (
        <div className="demo-chat-container">
            {/* Header */}
            <div className="demo-chat-header">
                <Sparkles className="demo-header-icon" />
                <div>
                    <h3>AI 금융 정책 분석 (Demo)</h3>
                    <p>소상공인 맞춤 정책 적합성 분석 시연</p>
                </div>
            </div>

            {/* Step 1: 사용자 입력 */}
            <div className="demo-section">
                <div className="demo-section-title">
                    <span className="step-badge">Step 1</span>
                    사업자 정보 입력
                </div>
                <div className="demo-input-grid">
                    <div className="demo-input-item">
                        <label>업종</label>
                        <div className="demo-input-value">{DEMO_USER_INPUT.businessType}</div>
                    </div>
                    <div className="demo-input-item">
                        <label>연매출</label>
                        <div className="demo-input-value">{DEMO_USER_INPUT.annualRevenue}</div>
                    </div>
                    <div className="demo-input-item">
                        <label>신용점수</label>
                        <div className="demo-input-value highlight">{DEMO_USER_INPUT.creditScore}</div>
                    </div>
                    <div className="demo-input-item">
                        <label>사업장 위치</label>
                        <div className="demo-input-value">{DEMO_USER_INPUT.location}</div>
                    </div>
                </div>
                {currentStep === 0 && (
                    <button className="demo-next-btn" onClick={handleNextStep}>
                        🔍 정책 분석 시작
                    </button>
                )}
            </div>

            {/* Step 2: 정책 분석 결과 */}
            {currentStep >= 1 && (
                <div className="demo-section fade-in">
                    <div className="demo-section-title">
                        <span className="step-badge">Step 2</span>
                        정책 자격 요건 비교
                    </div>
                    <p className="demo-description">
                        검색된 지식 베이스 정보를 바탕으로 <strong>{DEMO_USER_INPUT.businessType}</strong>,
                        연매출 <strong>{DEMO_USER_INPUT.annualRevenue}</strong>,
                        신용점수 <strong>{DEMO_USER_INPUT.creditScore}</strong>,
                        <strong>{DEMO_USER_INPUT.location}</strong> 소상공인에게 적용 가능한 금융 지원 정책들을 분석했습니다.
                    </p>

                    <div className="policy-list">
                        {POLICIES.map((policy, idx) => (
                            <div
                                key={policy.id}
                                className={`policy-card ${expandedPolicy === idx ? 'expanded' : ''}`}
                                onClick={() => setExpandedPolicy(expandedPolicy === idx ? null : idx)}
                            >
                                <div className="policy-header">
                                    <div className="policy-rank">#{idx + 1}</div>
                                    <div className="policy-info">
                                        <div className="policy-name">{policy.name}</div>
                                        <div className="policy-provider">{policy.provider}</div>
                                    </div>
                                    <div
                                        className="policy-fit-badge"
                                        style={{
                                            backgroundColor: getFitBg(policy.fitLevel),
                                            color: getFitColor(policy.fitLevel)
                                        }}
                                    >
                                        {policy.fit}
                                    </div>
                                    {expandedPolicy === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>

                                {expandedPolicy === idx && (
                                    <div className="policy-details">
                                        <div className="policy-detail-row">
                                            <span>대출한도</span>
                                            <strong>{policy.loanLimit}</strong>
                                        </div>
                                        <div className="policy-detail-row">
                                            <span>금리</span>
                                            <strong>{policy.interestRate}</strong>
                                        </div>
                                        <div className="policy-detail-row">
                                            <span>상환기간</span>
                                            <strong>{policy.term}</strong>
                                        </div>
                                        {policy.creditRequirement && (
                                            <div className="policy-detail-row">
                                                <span>신용점수 요건</span>
                                                <strong>{policy.creditRequirement}점 이상</strong>
                                                <CheckCircle size={16} color="#10B981" />
                                            </div>
                                        )}
                                        <div className="policy-reason">
                                            💡 {policy.reason}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {currentStep === 1 && (
                        <button className="demo-next-btn" onClick={handleNextStep}>
                            📊 승인 가능성 분석
                        </button>
                    )}
                </div>
            )}

            {/* Step 3: 승인 가능성 차트 */}
            {showChart && currentStep >= 2 && (
                <div className="demo-section fade-in">
                    <div className="demo-section-title">
                        <span className="step-badge">Step 3</span>
                        승인 가능성 계산 및 대시보드
                    </div>

                    <div className="demo-chart-container">
                        <h4><BarChart3 size={18} /> 정책별 승인 가능성</h4>
                        <div className="demo-bar-chart">
                            {POLICIES.map((policy, idx) => (
                                <div key={idx} className="chart-row">
                                    <div className="chart-label">{policy.name.substring(0, 15)}...</div>
                                    <div className="chart-bar-container">
                                        <div
                                            className="chart-bar"
                                            style={{
                                                width: `${policy.approvalRate}%`,
                                                backgroundColor: getFitColor(policy.fitLevel)
                                            }}
                                        />
                                        <span className="chart-value">{policy.approvalRate}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="demo-insights">
                        <h4>📊 주요 인사이트</h4>
                        <ul>
                            <li>
                                <CheckCircle size={16} color="#10B981" />
                                최우선 추천: <strong>외식업 자영업자 금융지원 협약보증 (85%)</strong>
                            </li>
                            <li>
                                <CheckCircle size={16} color="#10B981" />
                                신용점수 753점: 모든 정책 요구사항 충족
                            </li>
                            <li>
                                <AlertTriangle size={16} color="#F59E0B" />
                                주의: 인천 중구 정책은 지역 불일치 (부평구)
                            </li>
                        </ul>
                    </div>

                    {currentStep === 2 && (
                        <button className="demo-next-btn" onClick={handleNextStep}>
                            📋 보완 가이드 확인
                        </button>
                    )}
                </div>
            )}

            {/* Step 4: 보완 가이드 */}
            {showGuide && currentStep >= 3 && (
                <div className="demo-section fade-in">
                    <div className="demo-section-title">
                        <span className="step-badge">Step 4</span>
                        보완 가이드 및 위험 요소
                    </div>

                    <div className="demo-risk-section">
                        <h4>🚨 탈락 위험 요소</h4>
                        <div className="risk-bars">
                            {RISK_FACTORS.map((risk, idx) => (
                                <div key={idx} className="risk-row">
                                    <span className="risk-name">{risk.name}</span>
                                    <div className="risk-bar-container">
                                        <div
                                            className="risk-bar"
                                            style={{ width: `${risk.percent * 3}%` }}
                                        />
                                    </div>
                                    <span className="risk-percent">{risk.percent}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="demo-docs-section">
                        <h4><FileText size={18} /> 필수 준비 서류</h4>
                        <ul className="docs-list">
                            {REQUIRED_DOCS.map((doc, idx) => (
                                <li key={idx}>
                                    <CheckCircle size={14} color="#10B981" />
                                    {doc}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {currentStep === 3 && (
                        <button className="demo-next-btn" onClick={handleNextStep}>
                            📞 상세 상담 결과
                        </button>
                    )}
                </div>
            )}

            {/* Step 5: 최종 상담 결과 */}
            {showConsultation && currentStep >= 4 && (
                <div className="demo-section fade-in consultation-section">
                    <div className="demo-section-title">
                        <span className="step-badge final">Final</span>
                        AI 전략 파트너 상담 결과
                    </div>

                    <div className="consultation-summary">
                        <h4>📌 한줄 요약</h4>
                        <p>
                            음식점업(연매출 3억원, 신용점수 753점, 인천 부평구) 사장님께는
                            <strong style={{ color: '#10B981' }}> 외식업 자영업자 금융지원 협약보증(승인 가능성 85%)</strong>이
                            가장 유리하며, 업력 1년 이상 충족 시 즉시 신청 가능합니다.
                        </p>
                    </div>

                    <div className="consultation-recommendation">
                        <h4>🏆 추천 순위</h4>
                        <div className="rank-list">
                            <div className="rank-item gold">
                                <span className="rank-badge">1순위</span>
                                <div className="rank-content">
                                    <strong>외식업 자영업자 금융지원 협약보증</strong>
                                    <p>승인 가능성 85% | 5,000만원 한도 | 음식점업 특화</p>
                                </div>
                            </div>
                            <div className="rank-item silver">
                                <span className="rank-badge">2순위</span>
                                <div className="rank-content">
                                    <strong>스마트 혁신성장 소상공인 특례보증</strong>
                                    <p>승인 가능성 80% | 13개 은행 선택 가능</p>
                                </div>
                            </div>
                            <div className="rank-item bronze">
                                <span className="rank-badge">3순위</span>
                                <div className="rank-content">
                                    <strong>소상공인 이자차액 보전금 지원</strong>
                                    <p>승인 가능성 75% | 이자 2% 지원</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="consultation-contact">
                        <h4><Phone size={18} /> 신청 연락처</h4>
                        <div className="contact-info">
                            <p><strong>지역신용보증재단 인천지역본부:</strong> 1577-3790</p>
                            <p><strong>국민은행 소상공인 전용 창구</strong></p>
                        </div>
                    </div>

                    <div className="demo-complete">
                        ✅ 분석 완료 - 실제 서비스에서는 실시간 데이터를 기반으로 분석됩니다.
                    </div>
                </div>
            )}
        </div>
    );
}
