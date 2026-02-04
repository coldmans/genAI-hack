// OX 퀴즈 동적 생성 API 엔드포인트
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPolicies } from './lib/supabase';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface Quiz {
    question: string;
    answer: boolean;
    explanation: string;
    tip: string;
    relatedPolicy: string;
}

// 배열 섞기 (Fisher-Yates Shuffle)
function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Gemini API로 퀴즈 생성
async function generateQuizzesWithGemini(policies: any[]): Promise<Quiz[]> {
    if (!GEMINI_API_KEY) {
        console.log('[Quiz API] Gemini API key not configured, using shuffled fallback');
        return shuffleArray(getFallbackQuizzes());
    }

    // 정책 정보를 요약해서 프롬프트에 포함
    const policyContext = policies.slice(0, 10).map(p =>
        `- ${p.title} (출처: ${p.source})`
    ).join('\n');

    const seed = Math.random().toString(36).substring(7); // 랜덤 시드 추가

    const prompt = `당신은 소상공인 정책 전문가입니다. 아래 정책 정보를 바탕으로 소상공인/자영업자를 위한 OX 퀴즈 5개를 만들어주세요.
Seed: ${seed} (매번 다른 퀴즈를 생성하세요)

[정책 정보]
${policyContext}

[요구사항]
1. 소상공인이 실제로 알아야 할 유용한 정보를 퀴즈로 만들어주세요.
2. 정답이 O인 것과 X인 것을 섞어서 만들어주세요.
3. 설명은 친근하고 이해하기 쉽게 작성해주세요.
4. 팁은 실용적인 조언을 담아주세요.
5. 기존과 다른 새로운 관점의 퀴즈를 만들어주세요.

[출력 형식 - 반드시 이 JSON 형식으로만 응답하세요]
[
  {
    "question": "퀴즈 질문 (O 또는 X로 답할 수 있는 형식)",
    "answer": true 또는 false,
    "explanation": "정답 설명",
    "tip": "실용적인 팁",
    "relatedPolicy": "관련 정책명"
  }
]

JSON 배열만 출력하세요. 다른 텍스트는 포함하지 마세요.`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.9, // 다양성을 위해 온도 높임
                    maxOutputTokens: 2048,
                }
            })
        });

        if (!response.ok) {
            console.error('[Quiz API] Gemini API error:', response.status);
            return shuffleArray(getFallbackQuizzes());
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            console.error('[Quiz API] No text in Gemini response');
            return shuffleArray(getFallbackQuizzes());
        }

        console.log('[Quiz API] Raw Gemini Response:', text.substring(0, 100) + '...');

        // JSON 파싱 시도 (정규식으로 배열 추출)
        try {
            let jsonText = text;

            // 대괄호로 둘러싸인 JSON 배열 찾기
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                jsonText = jsonMatch[0];
            }

            const quizzes = JSON.parse(jsonText);

            if (Array.isArray(quizzes) && quizzes.length > 0) {
                console.log(`[Quiz API] Successfully generated ${quizzes.length} quizzes`);
                return quizzes.slice(0, 5); // 최대 5개
            } else {
                console.error('[Quiz API] Parsed JSON is not a valid array:', quizzes);
            }
        } catch (parseError) {
            console.error('[Quiz API] JSON parse error:', parseError);
            console.error('[Quiz API] Failed text:', text);
        }

        return shuffleArray(getFallbackQuizzes());
    } catch (error) {
        console.error('[Quiz API] Gemini request failed:', error);
        return shuffleArray(getFallbackQuizzes());
    }
}

// 폴백 퀴즈 데이터
function getFallbackQuizzes(): Quiz[] {
    return [
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
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS 헤더
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Supabase에서 최신 정책 가져오기
        let policies = [];
        try {
            policies = await getPolicies(10) || [];
        } catch (dbError) {
            console.log('[Quiz API] Database not available, using fallback');
        }

        // Gemini로 퀴즈 생성
        const quizzes = await generateQuizzesWithGemini(policies);

        return res.status(200).json({
            success: true,
            count: quizzes.length,
            generatedAt: new Date().toISOString(),
            quizzes
        });
    } catch (error) {
        console.error('[Quiz API] Error:', error);

        // 에러 시에도 폴백 퀴즈 반환
        return res.status(200).json({
            success: true,
            count: 5,
            quizzes: shuffleArray(getFallbackQuizzes()),
            fallback: true
        });
    }
}
