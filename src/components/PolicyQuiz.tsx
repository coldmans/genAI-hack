import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowRight, Trophy, Lightbulb, RotateCcw, Loader2, Sparkles } from 'lucide-react';

interface PolicyQuizProps {
    userProfile: any;
}

interface Quiz {
    id?: number;
    question: string;
    answer: boolean;
    explanation: string;
    tip: string;
    relatedPolicy?: string;
}

// 폴백 퀴즈 데이터 (API 실패 시 사용)
const FALLBACK_QUIZZES: Quiz[] = [
    {
        question: "소상공인 정책자금은 신용점수 600점 이하여도 신청할 수 있다",
        answer: true,
        explanation: "맞습니다! 신용보증재단의 특례보증을 통해 저신용자도 정책자금을 이용할 수 있습니다.",
        tip: "신용점수가 낮아도 포기하지 마세요. 지역신용보증재단에서 보증을 받으면 대출이 가능합니다.",
        relatedPolicy: "소상공인 특례보증"
    },
    {
        question: "음식점을 운영하면 외식업 전용 금융 지원을 받을 수 있다",
        answer: true,
        explanation: "맞습니다! 외식업 자영업자를 위한 별도의 협약보증 상품이 있습니다.",
        tip: "국민은행과 지역신용보증재단이 협약한 '외식업 자영업자 금융지원' 상품을 확인해보세요.",
        relatedPolicy: "외식업 자영업자 금융지원 협약보증"
    },
    {
        question: "소상공인 정책자금 대출 이자는 무조건 연 5% 이상이다",
        answer: false,
        explanation: "틀립니다! 정책자금은 시중금리보다 훨씬 낮은 연 2~3%대 금리로 제공됩니다.",
        tip: "이자차액 보전금 지원을 받으면 실질 금리를 더 낮출 수 있어요!",
        relatedPolicy: "소상공인 이자차액 보전금 지원"
    },
    {
        question: "사업자등록 후 1년이 지나야만 정책자금을 신청할 수 있다",
        answer: false,
        explanation: "틀립니다! 예비창업자나 창업 1년 미만도 신청 가능한 정책이 많습니다.",
        tip: "창업 초기라면 '청년 소상공인 특례보증'이나 '예비창업패키지'를 확인해보세요.",
        relatedPolicy: "청년 소상공인 특례보증"
    },
    {
        question: "연매출 10억 원 미만이면 소상공인으로 분류된다",
        answer: true,
        explanation: "맞습니다! 업종에 따라 다르지만, 대부분의 업종에서 연매출 10억 원 미만은 소상공인입니다.",
        tip: "소상공인 기준: 제조업 10인 미만, 서비스업 5인 미만의 상시 근로자 수도 중요해요.",
        relatedPolicy: "소상공인 기본법"
    }
];

export function PolicyQuiz({ userProfile }: PolicyQuizProps) {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAiGenerated, setIsAiGenerated] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState<number[]>([]);
    const [quizComplete, setQuizComplete] = useState(false);

    // API에서 퀴즈 가져오기
    useEffect(() => {
        const fetchQuizzes = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/quiz');
                const data = await response.json();

                console.log('[Quiz Debug] Key Configured:', data.isKeyConfigured);
                if (data.fallback) console.warn('[Quiz Debug] Using Fallback. Error:', data.error);

                if (data.success && data.quizzes && data.quizzes.length > 0) {
                    setQuizzes(data.quizzes);
                    setIsAiGenerated(!data.fallback);
                } else {
                    setQuizzes(FALLBACK_QUIZZES);
                    setIsAiGenerated(false);
                }
            } catch (error) {
                console.error('Failed to fetch quizzes:', error);
                setQuizzes(FALLBACK_QUIZZES);
                setIsAiGenerated(false);
            } finally {
                setLoading(false);
            }
        };

        fetchQuizzes();
    }, []);

    const currentQuiz = quizzes[currentIndex];
    const isCorrect = currentQuiz && selectedAnswer === currentQuiz.answer;

    const handleAnswer = (answer: boolean) => {
        if (showResult || !currentQuiz) return;

        setSelectedAnswer(answer);
        setShowResult(true);

        if (answer === currentQuiz.answer) {
            setScore(prev => prev + 1);
        }
        setAnswered(prev => [...prev, currentIndex]);
    };

    const handleNext = () => {
        if (currentIndex < quizzes.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setShowResult(false);
        } else {
            setQuizComplete(true);
        }
    };

    const handleRestart = async () => {
        setLoading(true);
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setScore(0);
        setAnswered([]);
        setQuizComplete(false);

        // 새로운 퀴즈 가져오기 (캐시 방지)
        try {
            const response = await fetch('/api/quiz?t=' + new Date().getTime());
            const data = await response.json();

            console.log('[Quiz Debug] Key Configured:', data.isKeyConfigured);
            if (data.fallback) console.warn('[Quiz Debug] Using Fallback. Error:', data.error);

            if (data.success && data.quizzes && data.quizzes.length > 0) {
                setQuizzes(data.quizzes);
                setIsAiGenerated(!data.fallback);
            } else {
                setQuizzes(FALLBACK_QUIZZES);
                setIsAiGenerated(false);
            }
        } catch (error) {
            console.error('Failed to fetch new quizzes:', error);
            setQuizzes(FALLBACK_QUIZZES);
            setIsAiGenerated(false);
        } finally {
            setLoading(false);
        }
    };

    const getScoreMessage = () => {
        const percentage = (score / quizzes.length) * 100;
        if (percentage === 100) return "🏆 완벽해요! 정책 전문가시네요!";
        if (percentage >= 80) return "🎉 대단해요! 정책을 잘 알고 계시네요!";
        if (percentage >= 60) return "👍 좋아요! 조금만 더 알아보면 완벽해요!";
        if (percentage >= 40) return "💪 괜찮아요! 앞으로 더 알아가면 됩니다!";
        return "📚 걱정 마세요! 이제부터 하나씩 알아가면 됩니다!";
    };

    // 로딩 화면
    if (loading) {
        return (
            <div className="quiz-container">
                <div className="quiz-loading">
                    <Sparkles className="loading-icon" size={48} />
                    <h3>AI가 퀴즈를 생성하고 있어요</h3>
                    <p>최신 정책 정보를 분석 중...</p>
                    <Loader2 className="spinner" size={32} />
                </div>
            </div>
        );
    }

    // 퀴즈 완료 화면
    if (quizComplete) {
        return (
            <div className="quiz-container">
                <div className="quiz-complete-card">
                    <Trophy className="quiz-trophy" size={64} />
                    <h2>퀴즈 완료!</h2>
                    <div className="quiz-final-score">
                        <span className="score-number">{score}</span>
                        <span className="score-total">/ {quizzes.length}</span>
                    </div>
                    <p className="score-message">{getScoreMessage()}</p>

                    <div className="quiz-summary">
                        <h4>📊 결과 요약</h4>
                        <div className="summary-stats">
                            <div className="stat-item correct">
                                <CheckCircle size={20} />
                                <span>정답 {score}개</span>
                            </div>
                            <div className="stat-item wrong">
                                <XCircle size={20} />
                                <span>오답 {quizzes.length - score}개</span>
                            </div>
                        </div>
                    </div>

                    <button className="quiz-restart-btn" onClick={handleRestart}>
                        <RotateCcw size={18} />
                        새로운 퀴즈 도전하기
                    </button>
                </div>
            </div>
        );
    }

    if (!currentQuiz) {
        return (
            <div className="quiz-container">
                <div className="quiz-loading">
                    <p>퀴즈를 불러오는데 실패했습니다.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-container">
            {/* AI 생성 배지 */}
            {isAiGenerated && (
                <div className="ai-badge">
                    <Sparkles size={14} />
                    AI가 생성한 퀴즈
                </div>
            )}

            {/* 진행 상태 */}
            <div className="quiz-progress">
                <div className="progress-text">
                    <span>Q{currentIndex + 1}</span>
                    <span className="progress-total">/ {quizzes.length}</span>
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${((currentIndex + 1) / quizzes.length) * 100}%` }}
                    />
                </div>
                <div className="score-display">
                    <Trophy size={16} />
                    <span>{score}점</span>
                </div>
            </div>

            {/* 퀴즈 카드 */}
            <div className={`quiz-card ${showResult ? (isCorrect ? 'correct' : 'wrong') : ''}`}>
                <div className="quiz-question">
                    <span className="question-label">Q.</span>
                    <p>{currentQuiz.question}</p>
                </div>

                {/* O/X 버튼 */}
                <div className="quiz-buttons">
                    <button
                        className={`quiz-btn quiz-o ${selectedAnswer === true ? 'selected' : ''} ${showResult && currentQuiz.answer === true ? 'correct-answer' : ''}`}
                        onClick={() => handleAnswer(true)}
                        disabled={showResult}
                    >
                        <span className="btn-icon">O</span>
                        <span className="btn-text">맞다</span>
                    </button>
                    <button
                        className={`quiz-btn quiz-x ${selectedAnswer === false ? 'selected' : ''} ${showResult && currentQuiz.answer === false ? 'correct-answer' : ''}`}
                        onClick={() => handleAnswer(false)}
                        disabled={showResult}
                    >
                        <span className="btn-icon">X</span>
                        <span className="btn-text">틀리다</span>
                    </button>
                </div>

                {/* 정답 결과 */}
                {showResult && (
                    <div className={`quiz-result ${isCorrect ? 'correct' : 'wrong'}`}>
                        <div className="result-header">
                            {isCorrect ? (
                                <>
                                    <CheckCircle size={24} />
                                    <span>정답이에요! 🎉</span>
                                </>
                            ) : (
                                <>
                                    <XCircle size={24} />
                                    <span>아쉬워요! 😢</span>
                                </>
                            )}
                        </div>

                        <p className="result-explanation">{currentQuiz.explanation}</p>

                        <div className="result-tip">
                            <Lightbulb size={16} />
                            <p>{currentQuiz.tip}</p>
                        </div>

                        {currentQuiz.relatedPolicy && (
                            <div className="related-policy">
                                <span className="policy-tag">📋 관련 정책</span>
                                <span className="policy-name">{currentQuiz.relatedPolicy}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 다음 버튼 */}
            {showResult && (
                <button className="quiz-next-btn" onClick={handleNext}>
                    {currentIndex < quizzes.length - 1 ? (
                        <>
                            다음 문제
                            <ArrowRight size={18} />
                        </>
                    ) : (
                        <>
                            결과 보기
                            <Trophy size={18} />
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
