import React, { useState } from 'react';
import { Building2, MapPin, Tag, ChevronRight } from 'lucide-react';

interface UserProfile {
    businessType: string;
    location: string;
    interests: string[];
    businessSize: string;
}

interface OnboardingProps {
    onComplete: (profile: UserProfile) => void;
}

// 업종 옵션
const BUSINESS_TYPES = [
    '음식점/카페',
    '소매점/편의점',
    '미용/뷰티',
    '서비스업',
    '제조업',
    '기타'
];

// 지역 옵션
const LOCATIONS = [
    '서울',
    '인천',
    '경기',
    '부산',
    '대구',
    '광주',
    '대전',
    '울산',
    '세종',
    '강원',
    '충북',
    '충남',
    '전북',
    '전남',
    '경북',
    '경남',
    '제주'
];

// 관심사 옵션
const INTERESTS = [
    { id: 'subsidy', label: '지원금/보조금', icon: '💰' },
    { id: 'loan', label: '저금리 대출', icon: '🏦' },
    { id: 'tax', label: '세금/세제 혜택', icon: '📋' },
    { id: 'labor', label: '노무/인사 관리', icon: '👥' },
    { id: 'hygiene', label: '위생/안전', icon: '🧹' },
    { id: 'marketing', label: '마케팅/홍보', icon: '📢' },
    { id: 'education', label: '교육/컨설팅', icon: '📚' },
    { id: 'export', label: '수출/해외진출', icon: '🌍' }
];

// 사업 규모 옵션
const BUSINESS_SIZES = [
    '1인 사업자',
    '5인 미만',
    '5~10인',
    '10인 이상'
];

export function Onboarding({ onComplete }: OnboardingProps) {
    const [step, setStep] = useState(1);
    const [profile, setProfile] = useState<UserProfile>({
        businessType: '',
        location: '',
        interests: [],
        businessSize: ''
    });

    const handleInterestToggle = (interestId: string) => {
        setProfile(prev => ({
            ...prev,
            interests: prev.interests.includes(interestId)
                ? prev.interests.filter(i => i !== interestId)
                : [...prev.interests, interestId]
        }));
    };

    const canProceed = () => {
        switch (step) {
            case 1: return profile.businessType !== '';
            case 2: return profile.location !== '';
            case 3: return profile.interests.length > 0;
            case 4: return profile.businessSize !== '';
            default: return false;
        }
    };

    const handleNext = () => {
        if (step < 4) {
            setStep(step + 1);
        } else {
            // 로컬스토리지에 저장
            localStorage.setItem('userProfile', JSON.stringify(profile));
            onComplete(profile);
        }
    };

    return (
        <div className="onboarding-container">
            {/* 진행 표시기 */}
            <div className="onboarding-progress">
                {[1, 2, 3, 4].map(s => (
                    <div
                        key={s}
                        className={`progress-dot ${s <= step ? 'active' : ''}`}
                    />
                ))}
            </div>

            {/* Step 1: 업종 선택 */}
            {step === 1 && (
                <div className="onboarding-step">
                    <div className="step-icon">
                        <Building2 size={32} />
                    </div>
                    <h2 className="step-title">어떤 업종을 운영하시나요?</h2>
                    <p className="step-desc">맞춤 정책 정보를 제공해드릴게요</p>

                    <div className="options-grid">
                        {BUSINESS_TYPES.map(type => (
                            <button
                                key={type}
                                className={`option-btn ${profile.businessType === type ? 'selected' : ''}`}
                                onClick={() => setProfile(prev => ({ ...prev, businessType: type }))}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 2: 지역 선택 */}
            {step === 2 && (
                <div className="onboarding-step">
                    <div className="step-icon">
                        <MapPin size={32} />
                    </div>
                    <h2 className="step-title">사업장 위치가 어디인가요?</h2>
                    <p className="step-desc">지역 맞춤 정책을 알려드릴게요</p>

                    <div className="options-grid location">
                        {LOCATIONS.map(loc => (
                            <button
                                key={loc}
                                className={`option-btn small ${profile.location === loc ? 'selected' : ''}`}
                                onClick={() => setProfile(prev => ({ ...prev, location: loc }))}
                            >
                                {loc}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 3: 관심사 선택 */}
            {step === 3 && (
                <div className="onboarding-step">
                    <div className="step-icon">
                        <Tag size={32} />
                    </div>
                    <h2 className="step-title">어떤 정보가 필요하세요?</h2>
                    <p className="step-desc">여러 개 선택할 수 있어요</p>

                    <div className="interests-grid">
                        {INTERESTS.map(interest => (
                            <button
                                key={interest.id}
                                className={`interest-btn ${profile.interests.includes(interest.id) ? 'selected' : ''}`}
                                onClick={() => handleInterestToggle(interest.id)}
                            >
                                <span className="interest-icon">{interest.icon}</span>
                                <span className="interest-label">{interest.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 4: 사업 규모 */}
            {step === 4 && (
                <div className="onboarding-step">
                    <div className="step-icon">
                        <Building2 size={32} />
                    </div>
                    <h2 className="step-title">사업 규모가 어떻게 되나요?</h2>
                    <p className="step-desc">규모에 맞는 지원 정책을 찾아드릴게요</p>

                    <div className="options-grid">
                        {BUSINESS_SIZES.map(size => (
                            <button
                                key={size}
                                className={`option-btn ${profile.businessSize === size ? 'selected' : ''}`}
                                onClick={() => setProfile(prev => ({ ...prev, businessSize: size }))}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 다음 버튼 */}
            <button
                className={`next-btn ${canProceed() ? 'enabled' : ''}`}
                onClick={handleNext}
                disabled={!canProceed()}
            >
                {step === 4 ? '시작하기' : '다음'}
                <ChevronRight size={20} />
            </button>
        </div>
    );
}
