import React, { useState } from 'react';
import { CheckCircle, XCircle, ArrowRight, Trophy, Lightbulb, RotateCcw } from 'lucide-react';

interface PolicyQuizProps {
    userProfile: any;
}

interface Quiz {
    id: number;
    question: string;
    answer: boolean;
    explanation: string;
    tip: string;
    relatedPolicy?: string;
}

const QUIZZES: Quiz[] = [
    {
        id: 1,
        question: "소상공인 정책자금은 신용점수 600점 이하여도 신청할 수 있다",
        answer: true,
        explanation: "맞습니다! 신용보증재단의 특례보증을 통해 저신용자도 정책자금을 이용할 수 있습니다.",
        tip: "신용점수가 낮아도 포기하지 마세요. 지역신용보증재단에서 보증을 받으면 대출이 가능합니다.",
        relatedPolicy: "소상공인 특례보증"
    },
    {
        id: 2,
        question: "음식점을 운영하면 외식업 전용 금융 지원을 받을 수 있다",
        answer: true,
        explanation: "맞습니다! 외식업 자영업자를 위한 별도의 협약보증 상품이 있습니다.",
        tip: "국민은행과 지역신용보증재단이 협약한 '외식업 자영업자 금융지원' 상품을 확인해보세요.",
        relatedPolicy: "외식업 자영업자 금융지원 협약보증"
    },
    {
        id: 3,
        question: "소상공인 정책자금 대출 이자는 무조건 연 5% 이상이다",
        answer: false,
        explanation: "틀립니다! 정책자금은 시중금리보다 훨씬 낮은 연 2~3%대 금리로 제공됩니다.",
        tip: "이자차액 보전금 지원을 받으면 실질 금리를 더 낮출 수 있어요!",
        relatedPolicy: "소상공인 이자차액 보전금 지원"
    },
    {
        id: 4,
        question: "사업자등록 후 1년이 지나야만 정책자금을 신청할 수 있다",
        answer: false,
        explanation: "틀립니다! 예비창업자나 창업 1년 미만도 신청 가능한 정책이 많습니다.",
        tip: "창업 초기라면 '청년 소상공인 특례보증'이나 '예비창업패키지'를 확인해보세요.",
        relatedPolicy: "청년 소상공인 특례보증"
    },
    {
        id: 5,
        question: "정책자금은 한 번만 받을 수 있다",
        answer: false,
        explanation: "틀립니다! 상환 완료 후 재신청이 가능하며, 여러 정책을 동시에 이용할 수도 있습니다.",
        tip: "기존 대출을 잘 상환하고 있다면 추가 정책자금 이용이 가능합니다.",
        relatedPolicy: "소상공인 정책자금"
    },
    {
        id: 6,
        question: "인터넷으로 정책자금 신청이 불가능하다",
        answer: false,
        explanation: "틀립니다! 소상공인시장진흥공단 홈페이지에서 온라인 신청이 가능합니다.",
        tip: "semas.or.kr 또는 bizinfo.go.kr에서 온라인으로 신청하세요. 현장 방문보다 빠릅니다!",
        relatedPolicy: "소상공인 정책자금 온라인 신청"
    },
    {
        id: 7,
        question: "연매출 10억 원 미만이면 소상공인으로 분류된다",
        answer: true,
        explanation: "맞습니다! 업종에 따라 다르지만, 대부분의 업종에서 연매출 10억 원 미만은 소상공인입니다.",
        tip: "소상공인 기준: 제조업 10인 미만, 서비스업 5인 미만의 상시 근로자 수도 중요해요.",
        relatedPolicy: "소상공인 기본법"
    },
    {
        id: 8,
        question: "폐업 후에는 재창업 지원을 받을 수 없다",
        answer: false,
        explanation: "틀립니다! 재도전 소상공인을 위한 별도 지원 정책이 있습니다.",
        tip: "'희망리턴패키지'를 통해 폐업 컨설팅, 재창업 교육, 재창업 자금까지 지원받을 수 있어요.",
        relatedPolicy: "희망리턴패키지"
    }
];

export function PolicyQuiz({ userProfile }: PolicyQuizProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState<number[]>([]);
    const [quizComplete, setQuizComplete] = useState(false);

    const currentQuiz = QUIZZES[currentIndex];
    const isCorrect = selectedAnswer === currentQuiz.answer;

    const handleAnswer = (answer: boolean) => {
        if (showResult) return;

        setSelectedAnswer(answer);
        setShowResult(true);

        if (answer === currentQuiz.answer) {
            setScore(prev => prev + 1);
        }
        setAnswered(prev => [...prev, currentIndex]);
    };

    const handleNext = () => {
        if (currentIndex < QUIZZES.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setShowResult(false);
        } else {
            setQuizComplete(true);
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setScore(0);
        setAnswered([]);
        setQuizComplete(false);
    };

    const getScoreMessage = () => {
        const percentage = (score / QUIZZES.length) * 100;
        if (percentage === 100) return "🏆 완벽해요! 정책 전문가시네요!";
        if (percentage >= 80) return "🎉 대단해요! 정책을 잘 알고 계시네요!";
        if (percentage >= 60) return "👍 좋아요! 조금만 더 알아보면 완벽해요!";
        if (percentage >= 40) return "💪 괜찮아요! 앞으로 더 알아가면 됩니다!";
        return "📚 걱정 마세요! 이제부터 하나씩 알아가면 됩니다!";
    };

    // 퀴즈 완료 화면
    if (quizComplete) {
        return (
            <div className="quiz-container">
                <div className="quiz-complete-card">
                    <Trophy className="quiz-trophy" size={64} />
                    <h2>퀴즈 완료!</h2>
                    <div className="quiz-final-score">
                        <span className="score-number">{score}</span>
                        <span className="score-total">/ {QUIZZES.length}</span>
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
                                <span>오답 {QUIZZES.length - score}개</span>
                            </div>
                        </div>
                    </div>

                    <button className="quiz-restart-btn" onClick={handleRestart}>
                        <RotateCcw size={18} />
                        다시 도전하기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-container">
            {/* 진행 상태 */}
            <div className="quiz-progress">
                <div className="progress-text">
                    <span>Q{currentIndex + 1}</span>
                    <span className="progress-total">/ {QUIZZES.length}</span>
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${((currentIndex + 1) / QUIZZES.length) * 100}%` }}
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
                    {currentIndex < QUIZZES.length - 1 ? (
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
